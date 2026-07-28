import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

// WSL2 Compatibility: append flags if running under Windows Subsystem for Linux
if (os.release().toLowerCase().includes('microsoft') || process.env.WSL_DISTRO_NAME) {
  app.commandLine.appendSwitch('no-sandbox');
  app.commandLine.appendSwitch('disable-gpu');
  app.commandLine.appendSwitch('disable-software-rasterizer');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;

// Normalize cross-platform file paths (e.g. Windows drive letters C:\ in WSL Linux)
function toNativePath(p: string | null | undefined): string {
  if (!p) return '';
  if (process.platform === 'linux' && /^[a-zA-Z]:[/\\]/.test(p)) {
    const drive = p[0].toLowerCase();
    const rest = p.slice(2).replace(/\\/g, '/');
    return `/mnt/${drive}${rest.startsWith('/') ? '' : '/'}${rest}`;
  }
  return p;
}

// Ensure Snap-compatible cache working directory inside $HOME instead of /tmp
function getCacheDir(): string {
  const baseDir = path.join(os.homedir(), '.cache', 'typstcode');
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }
  return baseDir;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 650,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#090d16',
      symbolColor: '#94a3b8',
      height: 38
    },
    backgroundColor: '#090d16',
    webPreferences: {
      preload: fs.existsSync(path.join(__dirname, 'preload.js'))
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    icon: path.join(__dirname, '../public/favicon.png')
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handler: Typst Live Compilation to SVG pages
ipcMain.handle('typst:compile', async (_event, { code, rootDir }: { code: string; rootDir?: string }) => {
  const startTime = Date.now();
  const cacheBase = getCacheDir();
  const tempDir = fs.mkdtempSync(path.join(cacheBase, 'build-'));
  const inputFilePath = path.join(tempDir, 'document.typ');
  const outputPattern = path.join(tempDir, 'page-{p}.svg');

  try {
    fs.writeFileSync(inputFilePath, code, 'utf-8');

    const compileRootDir = rootDir ? toNativePath(rootDir) : tempDir;
    const args = ['compile', inputFilePath, outputPattern, '--format', 'svg', '--root', compileRootDir];

    return await new Promise((resolve) => {
      const typstProcess = spawn('typst', args, {
        cwd: compileRootDir
      });

      let stderrData = '';

      typstProcess.stderr.on('data', (data) => {
        stderrData += data.toString();
      });

      typstProcess.on('close', (codeExit) => {
        const timeMs = Date.now() - startTime;

        if (codeExit !== 0) {
          const diagnostics = parseTypstErrors(stderrData);
          fs.rmSync(tempDir, { recursive: true, force: true });
          resolve({
            success: false,
            pages: [],
            diagnostics,
            rawError: stderrData,
            timeMs
          });
          return;
        }

        // Read all SVG files generated in tempDir
        const files = fs.readdirSync(tempDir);
        const svgFiles = files
          .filter((f) => f.startsWith('page-') && f.endsWith('.svg'))
          .sort((a, b) => {
            const numA = parseInt(a.replace('page-', '').replace('.svg', ''), 10);
            const numB = parseInt(b.replace('page-', '').replace('.svg', ''), 10);
            return numA - numB;
          });

        const pages = svgFiles.map((file) => {
          return fs.readFileSync(path.join(tempDir, file), 'utf-8');
        });

        // Clean temp directory
        fs.rmSync(tempDir, { recursive: true, force: true });

        resolve({
          success: true,
          pages,
          diagnostics: [],
          rawError: '',
          timeMs
        });
      });

      typstProcess.on('error', (err) => {
        fs.rmSync(tempDir, { recursive: true, force: true });
        resolve({
          success: false,
          pages: [],
          diagnostics: [{ line: 1, column: 1, message: `Failed to execute Typst binary: ${err.message}` }],
          rawError: err.message,
          timeMs: Date.now() - startTime
        });
      });
    });
  } catch (err: any) {
    fs.rmSync(tempDir, { recursive: true, force: true });
    return {
      success: false,
      pages: [],
      diagnostics: [{ line: 1, column: 1, message: err.message || 'Compilation exception' }],
      rawError: err.message,
      timeMs: Date.now() - startTime
    };
  }
});

// IPC Handler: File Open Dialog
ipcMain.handle('file:open', async () => {
  console.log('[Main IPC] file:open handler invoked');
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Typst Files', extensions: ['typ'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  console.log('[Main IPC] file:open dialog result:', result);
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const filePath = toNativePath(result.filePaths[0]);
  console.log('[Main IPC] file:open normalized filePath:', filePath);
  const content = fs.readFileSync(filePath, 'utf-8');
  return { filePath, content };
});

// IPC Handler: Folder Open Dialog
ipcMain.handle('folder:open', async () => {
  console.log('[Main IPC] folder:open handler invoked');
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Open Workspace Folder',
    properties: ['openDirectory']
  });

  console.log('[Main IPC] folder:open dialog result:', result);
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const dirPath = toNativePath(result.filePaths[0]);
  console.log('[Main IPC] folder:open normalized dirPath:', dirPath);
  return { dirPath };
});

// IPC Handler: File Save Dialog
ipcMain.handle('file:save', async (_event, { filePath, content }: { filePath: string | null; content: string }) => {
  console.log('[Main IPC] file:save handler invoked with filePath:', filePath, 'content length:', content?.length);
  let targetPath = filePath ? toNativePath(filePath) : null;
  console.log('[Main IPC] file:save targetPath after toNativePath:', targetPath);

  if (!targetPath) {
    console.log('[Main IPC] file:save targetPath is null, opening showSaveFilePicker dialog...');
    if (!mainWindow) return null;
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Save Typst File',
      defaultPath: 'document.typ',
      filters: [
        { name: 'Typst Files', extensions: ['typ'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    console.log('[Main IPC] file:save showSaveDialog result:', result);
    if (result.canceled || !result.filePath) {
      return null;
    }
    targetPath = toNativePath(result.filePath);
  } else if (!path.isAbsolute(targetPath)) {
    targetPath = path.resolve(process.cwd(), targetPath);
    console.log('[Main IPC] file:save resolved relative targetPath to absolute:', targetPath);
  }

  try {
    console.log('[Main IPC] Writing file directly to targetPath:', targetPath);
    fs.writeFileSync(targetPath, content, 'utf-8');
    console.log('[Main IPC] File write successful to:', targetPath);
    return { filePath: targetPath };
  } catch (err: any) {
    console.error('[Main IPC] fs.writeFileSync error:', err);
    return null;
  }
});

// IPC Handler: Read Directory Tree for File Browser
ipcMain.handle('fs:readDir', async (_event, { dirPath }: { dirPath?: string }) => {
  console.log('[Main IPC] fs:readDir handler invoked with dirPath:', dirPath);
  const nativeDir = dirPath ? toNativePath(dirPath) : process.cwd();
  const targetDir = path.resolve(nativeDir);
  console.log('[Main IPC] fs:readDir resolved targetDir:', targetDir);
  try {
    const entries = fs.readdirSync(targetDir, { withFileTypes: true });

    const items = entries
      .filter((entry) => {
        // Exclude internal hidden/build folders
        return !['node_modules', '.git', 'dist', 'dist-electron', 'release', '.cache'].includes(entry.name);
      })
      .map((entry) => {
        const fullPath = path.join(targetDir, entry.name);
        return {
          name: entry.name,
          isDirectory: entry.isDirectory(),
          path: fullPath
        };
      })
      .sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });

    console.log('[Main IPC] fs:readDir found items count:', items.length);
    return { success: true, dirPath: targetDir, items };
  } catch (err: any) {
    console.error('[Main IPC] fs:readDir error:', err);
    return { success: false, dirPath: targetDir, items: [], error: err.message };
  }
});

// IPC Handler: Read Specific File by Path
ipcMain.handle('fs:readFileByPath', async (_event, { filePath }: { filePath: string }) => {
  console.log('[Main IPC] fs:readFileByPath handler invoked with filePath:', filePath);
  const targetPath = toNativePath(filePath);
  console.log('[Main IPC] fs:readFileByPath normalized targetPath:', targetPath);
  try {
    const content = fs.readFileSync(targetPath, 'utf-8');
    console.log('[Main IPC] fs:readFileByPath successfully read content length:', content.length);
    return { success: true, filePath: targetPath, content };
  } catch (err: any) {
    console.error('[Main IPC] readFileByPath failed for', filePath, '->', targetPath, err);
    return { success: false, filePath: targetPath, content: '', error: err.message };
  }
});

// IPC Handler: Export PDF
ipcMain.handle('export:pdf', async (_event, { code, suggestedName }: { code: string; suggestedName?: string }) => {
  if (!mainWindow) return null;
  const saveResult = await dialog.showSaveDialog(mainWindow, {
    title: 'Export PDF',
    defaultPath: suggestedName || 'document.pdf',
    filters: [{ name: 'PDF Document', extensions: ['pdf'] }]
  });

  if (saveResult.canceled || !saveResult.filePath) {
    return null;
  }

  const outputPath = toNativePath(saveResult.filePath);
  const cacheBase = getCacheDir();
  const tempDir = fs.mkdtempSync(path.join(cacheBase, 'pdf-'));
  const inputFilePath = path.join(tempDir, 'document.typ');
  fs.writeFileSync(inputFilePath, code, 'utf-8');

  return new Promise((resolve) => {
    const proc = spawn('typst', ['compile', inputFilePath, outputPath, '--format', 'pdf', '--root', tempDir]);
    let stderr = '';
    proc.stderr.on('data', (d) => (stderr += d.toString()));
    proc.on('close', (exitCode) => {
      fs.rmSync(tempDir, { recursive: true, force: true });
      if (exitCode === 0) {
        resolve({ success: true, filePath: outputPath });
      } else {
        resolve({ success: false, error: stderr });
      }
    });
  });
});

// IPC Handler: Export PNG
ipcMain.handle('export:png', async (_event, { code, ppi = 144 }: { code: string; ppi?: number }) => {
  if (!mainWindow) return null;
  const saveResult = await dialog.showSaveDialog(mainWindow, {
    title: 'Export PNG Image',
    defaultPath: 'document.png',
    filters: [{ name: 'PNG Image', extensions: ['png'] }]
  });

  if (saveResult.canceled || !saveResult.filePath) {
    return null;
  }

  const outputPath = toNativePath(saveResult.filePath);
  const cacheBase = getCacheDir();
  const tempDir = fs.mkdtempSync(path.join(cacheBase, 'png-'));
  const inputFilePath = path.join(tempDir, 'document.typ');
  fs.writeFileSync(inputFilePath, code, 'utf-8');

  return new Promise((resolve) => {
    const proc = spawn('typst', ['compile', inputFilePath, outputPath, '--format', 'png', '--ppi', ppi.toString(), '--root', tempDir]);
    let stderr = '';
    proc.stderr.on('data', (d) => (stderr += d.toString()));
    proc.on('close', (exitCode) => {
      fs.rmSync(tempDir, { recursive: true, force: true });
      if (exitCode === 0) {
        resolve({ success: true, filePath: outputPath });
      } else {
        resolve({ success: false, error: stderr });
      }
    });
  });
});

// IPC Handler: App version
ipcMain.handle('app:version', () => {
  return app.getVersion();
});

// Utility function to parse typst stderr into structured error markers
function parseTypstErrors(stderr: string): Array<{ line: number; column: number; message: string; hint?: string }> {
  const diagnostics: Array<{ line: number; column: number; message: string; hint?: string }> = [];
  const lines = stderr.split('\n');

  let currentMsg = '';
  let lineNum = 1;
  let colNum = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('error:') || line.startsWith('warning:')) {
      currentMsg = line.replace(/^error:\s*/, '').replace(/^warning:\s*/, '').trim();
    }

    const matchLoc = line.match(/┌─\s*.*?:(\d+):(\d+)/) || line.match(/:\s*(\d+):(\d+)/);
    if (matchLoc) {
      lineNum = parseInt(matchLoc[1], 10);
      colNum = parseInt(matchLoc[2], 10);

      diagnostics.push({
        line: lineNum,
        column: colNum,
        message: currentMsg || line.trim()
      });
    }
  }

  if (diagnostics.length === 0 && stderr.trim().length > 0) {
    diagnostics.push({
      line: 1,
      column: 1,
      message: stderr.trim()
    });
  }

  return diagnostics;
}

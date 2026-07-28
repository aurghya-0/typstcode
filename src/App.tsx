import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Toolbar } from './components/Toolbar';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { Sidebar } from './components/Sidebar';
import { StatusBar } from './components/StatusBar';
import { ErrorPanel } from './components/ErrorPanel';
import { TemplatesModal } from './components/TemplatesModal';
import { TEMPLATES, TypstTemplate } from './utils/templates';
import { compileTypstWasm } from './utils/wasmTypst';

// Type definitions for window.electronAPI
declare global {
  interface Window {
    electronAPI?: {
      compileTypst: (code: string, rootDir?: string) => Promise<{
        success: boolean;
        pages: string[];
        diagnostics: Array<{ line: number; column: number; message: string; hint?: string }>;
        rawError: string;
        timeMs: number;
      }>;
      openFile: () => Promise<{ filePath: string; content: string } | null>;
      openFolder: () => Promise<{ dirPath: string } | null>;
      saveFile: (filePath: string | null, content: string) => Promise<{ filePath: string } | null>;
      exportPdf: (code: string, suggestedName?: string) => Promise<{ success: boolean; filePath?: string; error?: string } | null>;
      exportPng: (code: string, ppi?: number) => Promise<{ success: boolean; filePath?: string; error?: string } | null>;
      readDir: (dirPath?: string) => Promise<{ success: boolean; dirPath: string; items: Array<{ name: string; isDirectory: boolean; path: string }> }>;
      readFileByPath: (filePath: string) => Promise<{ success: boolean; filePath: string; content: string; error?: string }>;
      getAppVersion: () => Promise<string>;
    };
  }
}

export const App: React.FC = () => {
  const [code, setCode] = useState<string>(TEMPLATES[0].code);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [autoCompile, setAutoCompile] = useState<boolean>(true);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [pages, setPages] = useState<string[]>([]);
  const [diagnostics, setDiagnostics] = useState<Array<{ line: number; column: number; message: string; hint?: string }>>([]);
  const [rawError, setRawError] = useState<string | null>(null);
  const [compilationTimeMs, setCompilationTimeMs] = useState<number | null>(null);
  
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState<boolean>(false);
  const [isErrorPanelOpen, setIsErrorPanelOpen] = useState<boolean>(true);
  const [cursorPos, setCursorPos] = useState<{ line: number; column: number }>({ line: 1, column: 1 });
  const [typstVersion, setTypstVersion] = useState<string>('Typst v0.15.0');

  // Workspace Folder & File Tree State
  const [currentDirPath, setCurrentDirPath] = useState<string>('');
  const [files, setFiles] = useState<Array<{ name: string; isDirectory: boolean; path: string }>>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const fileObjectsMapRef = useRef<Map<string, File>>(new Map());

  // Helper for cross-platform root directory parsing
  const getRootDir = (pathStr: string | null) => {
    if (!pathStr) return undefined;
    const lastIdx = Math.max(pathStr.lastIndexOf('/'), pathStr.lastIndexOf('\\'));
    return lastIdx !== -1 ? pathStr.substring(0, lastIdx) : undefined;
  };

  // Load Directory Tree
  const loadDirectory = useCallback(async (dirPath?: string) => {
    if (window.electronAPI?.readDir) {
      setIsLoadingFiles(true);
      try {
        const res = await window.electronAPI.readDir(dirPath);
        if (res.success) {
          setCurrentDirPath(res.dirPath);
          setFiles(res.items);
        }
      } catch (err) {
        console.error('Failed to load directory:', err);
      } finally {
        setIsLoadingFiles(false);
      }
    }
  }, []);

  useEffect(() => {
    if (window.electronAPI?.readDir) {
      loadDirectory();
    }
  }, [loadDirectory]);

  // Compile Handler (uses Electron CLI if available and working, or WASM compiler as fallback)
  const handleCompile = useCallback(async (currentCode: string = code, currentFilePath: string | null = filePath) => {
    setIsCompiling(true);

    if (window.electronAPI) {
      try {
        const rootDir = getRootDir(currentFilePath);
        const res = await window.electronAPI.compileTypst(currentCode, rootDir);

        if (res.success) {
          setIsCompiling(false);
          setCompilationTimeMs(res.timeMs);
          setPages(res.pages);
          setDiagnostics([]);
          setRawError(null);
          return;
        }

        // If system binary is missing (ENOENT / CommandNotFound), run WASM fallback
        const errString = res.rawError || '';
        if (
          errString.includes('Failed to execute Typst binary') ||
          errString.includes('ENOENT') ||
          errString.includes('not recognized') ||
          errString.includes('CommandNotFoundException')
        ) {
          const wasmRes = await compileTypstWasm(currentCode);
          setIsCompiling(false);
          setCompilationTimeMs(wasmRes.timeMs);
          if (wasmRes.success) {
            setPages(wasmRes.pages);
            setDiagnostics([]);
            setRawError(null);
          } else {
            setDiagnostics(wasmRes.diagnostics);
            setRawError(wasmRes.rawError);
          }
          return;
        }

        setIsCompiling(false);
        setCompilationTimeMs(res.timeMs);
        setDiagnostics(res.diagnostics);
        setRawError(res.rawError);
      } catch (err: any) {
        // Fallback to WASM
        const wasmRes = await compileTypstWasm(currentCode);
        setIsCompiling(false);
        setCompilationTimeMs(wasmRes.timeMs);
        if (wasmRes.success) {
          setPages(wasmRes.pages);
          setDiagnostics([]);
          setRawError(null);
        } else {
          setDiagnostics([{ line: 1, column: 1, message: err.message || 'Compilation failed' }]);
          setRawError(err.message || 'Compilation failed');
        }
      }
    } else {
      // Browser environment: WASM compiler
      const wasmRes = await compileTypstWasm(currentCode);
      setIsCompiling(false);
      setCompilationTimeMs(wasmRes.timeMs);
      if (wasmRes.success) {
        setPages(wasmRes.pages);
        setDiagnostics([]);
        setRawError(null);
      } else {
        setDiagnostics(wasmRes.diagnostics);
        setRawError(wasmRes.rawError);
      }
    }
  }, [code, filePath]);

  // Initial compilation on mount
  useEffect(() => {
    handleCompile(code, filePath);
  }, []);

  // Debounced auto-compilation when code changes
  useEffect(() => {
    if (!autoCompile) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      handleCompile(code, filePath);
    }, 350);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [code, filePath, autoCompile, handleCompile]);

  // File Operations
  const handleOpenFileByPath = useCallback(async (selectedPath: string) => {
    if (window.electronAPI?.readFileByPath) {
      try {
        const res = await window.electronAPI.readFileByPath(selectedPath);
        if (res.success) {
          setFilePath(res.filePath);
          setCode(res.content);
          handleCompile(res.content, res.filePath);
        } else {
          console.error('Failed to read file by path:', res.error);
        }
      } catch (err) {
        console.error('Error reading file by path:', err);
      }
    } else {
      // Browser environment fallback: read from fileObjectsMap
      const fileName = selectedPath.split(/[/\\]/).pop() || selectedPath;
      const fileObj = fileObjectsMapRef.current.get(selectedPath) || fileObjectsMapRef.current.get(fileName);
      
      if (fileObj) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const content = evt.target?.result as string;
          if (content !== undefined) {
            setFilePath(selectedPath);
            setCode(content);
            handleCompile(content, selectedPath);
          }
        };
        reader.readAsText(fileObj);
      }
    }
  }, [handleCompile]);

  const handleOpenFile = useCallback(async () => {
    if (window.electronAPI?.openFile) {
      try {
        const res = await window.electronAPI.openFile();
        if (res) {
          setFilePath(res.filePath);
          setCode(res.content);
          handleCompile(res.content, res.filePath);
        }
      } catch (err) {
        console.error('Failed to open file via Electron dialog:', err);
      }
    } else if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [handleCompile]);

  const handleOpenFolder = useCallback(async () => {
    if (window.electronAPI?.openFolder) {
      try {
        const res = await window.electronAPI.openFolder();
        if (res && res.dirPath) {
          await loadDirectory(res.dirPath);
        }
      } catch (err) {
        console.error('Failed to open folder:', err);
      }
    } else if (folderInputRef.current) {
      folderInputRef.current.click();
    }
  }, [loadDirectory]);

  const handleFolderInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = e.target.files;
    if (!filesList || filesList.length === 0) return;

    fileObjectsMapRef.current.clear();
    const fileItemsMap = new Map<string, { name: string; isDirectory: boolean; path: string }>();
    const firstPath = filesList[0].webkitRelativePath || '';
    const rootFolderName = firstPath.split('/')[0] || 'Selected Folder';

    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];
      const relPath = file.webkitRelativePath;
      fileObjectsMapRef.current.set(relPath, file);
      fileObjectsMapRef.current.set(file.name, file);

      const parts = relPath.split('/');
      if (parts.length > 1) {
        const itemPath = parts.slice(1).join('/');
        const item = parts[1];
        if (!fileItemsMap.has(item)) {
          const isDir = parts.length > 2;
          fileItemsMap.set(item, {
            name: item,
            isDirectory: isDir,
            path: itemPath
          });
        }
      } else {
        fileItemsMap.set(file.name, {
          name: file.name,
          isDirectory: false,
          path: file.name
        });
      }
    }

    const items = Array.from(fileItemsMap.values()).sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });

    setCurrentDirPath(rootFolderName);
    setFiles(items);
    e.target.value = '';
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content !== undefined) {
        setFilePath(file.name);
        setCode(content);
        handleCompile(content, file.name);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSaveFile = async () => {
    if (!window.electronAPI) return;
    const res = await window.electronAPI.saveFile(filePath, code);
    if (res) {
      setFilePath(res.filePath);
    }
  };

  // Global Keyboard Shortcuts (Ctrl+O, Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        handleOpenFile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleOpenFile]);

  const handleExportPdf = async () => {
    if (!window.electronAPI) return;
    const suggestedName = filePath
      ? filePath.split(/[/\\]/).pop()?.replace(/\.typ$/i, '.pdf')
      : 'document.pdf';
    await window.electronAPI.exportPdf(code, suggestedName);
  };

  const handleExportPng = async () => {
    if (!window.electronAPI) return;
    await window.electronAPI.exportPng(code);
  };

  const handleSelectTemplate = (template: TypstTemplate) => {
    setCode(template.code);
    setFilePath(null);
    handleCompile(template.code);
  };

  const handleInsertSnippet = (snippet: string) => {
    setCode((prev) => prev + snippet);
  };

  const handleJumpToLine = (line: number) => {
    setCursorPos({ line, column: 1 });
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-[#07090e] text-slate-100 overflow-hidden font-sans">
      {/* Top Application Toolbar */}
      <Toolbar
        fileName={filePath}
        autoCompile={autoCompile}
        setAutoCompile={setAutoCompile}
        onCompile={() => handleCompile(code)}
        isCompiling={isCompiling}
        onOpen={handleOpenFile}
        onOpenFolder={handleOpenFolder}
        onSave={handleSaveFile}
        onExportPdf={handleExportPdf}
        onExportPng={handleExportPng}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        viewMode={viewMode}
        setViewMode={setViewMode}
        compilationTimeMs={compilationTimeMs}
      />

      {/* Main App Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Collapsible Sidebar */}
        <Sidebar
          code={code}
          activeFilePath={filePath}
          currentDirPath={currentDirPath}
          files={files}
          isLoadingFiles={isLoadingFiles}
          onLoadDirectory={loadDirectory}
          onOpenFileByPath={handleOpenFileByPath}
          onInsertSnippet={handleInsertSnippet}
          onSelectHeading={handleJumpToLine}
          onOpenTemplates={() => setIsTemplatesOpen(true)}
          onOpenFolder={handleOpenFolder}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />

        {/* Center/Right Pane Workspace */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="flex-1 flex overflow-hidden relative">
            {/* Editor Pane */}
            {(viewMode === 'split' || viewMode === 'editor') && (
              <div
                className={`h-full flex flex-col ${
                  viewMode === 'split' ? 'w-1/2' : 'w-full'
                }`}
              >
                <Editor
                  code={code}
                  onChange={setCode}
                  diagnostics={diagnostics}
                  onCursorChange={(l, c) => setCursorPos({ line: l, column: c })}
                  onSave={handleSaveFile}
                  onCompile={() => handleCompile(code)}
                />
              </div>
            )}

            {/* Live Preview Pane */}
            {(viewMode === 'split' || viewMode === 'preview') && (
              <div
                className={`h-full ${
                  viewMode === 'split' ? 'w-1/2' : 'w-full'
                }`}
              >
                <Preview
                  pages={pages}
                  isCompiling={isCompiling}
                  error={rawError}
                  compilationTimeMs={compilationTimeMs}
                />
              </div>
            )}
          </div>

          {/* Bottom Diagnostic Panel for Errors */}
          <ErrorPanel
            diagnostics={diagnostics}
            onSelectDiagnostic={(line) => handleJumpToLine(line)}
            isOpen={isErrorPanelOpen}
            setIsOpen={setIsErrorPanelOpen}
          />
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar
        cursorPosition={cursorPos}
        code={code}
        isCompiling={isCompiling}
        hasError={diagnostics.length > 0}
        compilationTimeMs={compilationTimeMs}
        typstVersion={typstVersion}
      />

      {/* Hidden File Input for Browser Fallback */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".typ,.txt"
        className="hidden"
      />

      {/* Hidden Folder Input for Browser Fallback */}
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleFolderInputChange}
        //@ts-ignore
        webkitdirectory=""
        directory=""
        className="hidden"
      />

      {/* Template Gallery Modal */}
      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  );
};

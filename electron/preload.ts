import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  compileTypst: (code: string, rootDir?: string) =>
    ipcRenderer.invoke('typst:compile', { code, rootDir }),
  openFile: () => ipcRenderer.invoke('file:open'),
  openFolder: () => ipcRenderer.invoke('folder:open'),
  saveFile: (filePath: string | null, content: string) =>
    ipcRenderer.invoke('file:save', { filePath, content }),
  exportPdf: (code: string, suggestedName?: string) =>
    ipcRenderer.invoke('export:pdf', { code, suggestedName }),
  exportPng: (code: string, ppi?: number) =>
    ipcRenderer.invoke('export:png', { code, ppi }),
  exportSvg: (code: string) =>
    ipcRenderer.invoke('export:svg', { code }),
  readDir: (dirPath?: string) =>
    ipcRenderer.invoke('fs:readDir', { dirPath }),
  readFileByPath: (filePath: string) =>
    ipcRenderer.invoke('fs:readFileByPath', { filePath }),
  getAppVersion: () => ipcRenderer.invoke('app:version'),
});

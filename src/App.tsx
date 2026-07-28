import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Toolbar } from './components/Toolbar';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { Sidebar } from './components/Sidebar';
import { StatusBar } from './components/StatusBar';
import { ErrorPanel } from './components/ErrorPanel';
import { TemplatesModal } from './components/TemplatesModal';
import { TEMPLATES, TypstTemplate } from './utils/templates';

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
      saveFile: (filePath: string | null, content: string) => Promise<{ filePath: string } | null>;
      exportPdf: (code: string, suggestedName?: string) => Promise<{ success: boolean; filePath?: string; error?: string } | null>;
      exportPng: (code: string, ppi?: number) => Promise<{ success: boolean; filePath?: string; error?: string } | null>;
      readDir: (dirPath?: string) => Promise<{ success: boolean; dirPath: string; items: Array<{ name: string; isDirectory: boolean; path: string }> }>;
      readFileByPath: (filePath: string) => Promise<{ success: boolean; filePath: string; content: string }>;
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

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Compile Handler
  const handleCompile = useCallback(async (currentCode: string = code, currentFilePath: string | null = filePath) => {
    setIsCompiling(true);

    if (window.electronAPI) {
      try {
        const rootDir = currentFilePath ? currentFilePath.substring(0, currentFilePath.lastIndexOf('/')) : undefined;
        const res = await window.electronAPI.compileTypst(currentCode, rootDir);
        setIsCompiling(false);
        setCompilationTimeMs(res.timeMs);

        if (res.success) {
          setPages(res.pages);
          setDiagnostics([]);
          setRawError(null);
        } else {
          setDiagnostics(res.diagnostics);
          setRawError(res.rawError);
        }
      } catch (err: any) {
        setIsCompiling(false);
        setRawError(err.message || 'Compilation failed');
      }
    } else {
      // Fallback for Web browser preview if electronAPI is not attached
      setTimeout(() => {
        setIsCompiling(false);
        setCompilationTimeMs(15);
      }, 300);
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
  const handleOpenFileByPath = async (selectedPath: string) => {
    if (!window.electronAPI?.readFileByPath) return;
    const res = await window.electronAPI.readFileByPath(selectedPath);
    if (res.success) {
      setFilePath(res.filePath);
      setCode(res.content);
      handleCompile(res.content, res.filePath);
    }
  };

  const handleOpenFile = async () => {
    if (!window.electronAPI?.openFile) return;
    const res = await window.electronAPI.openFile();
    if (res) {
      setFilePath(res.filePath);
      setCode(res.content);
      handleCompile(res.content, res.filePath);
    }
  };

  const handleSaveFile = async () => {
    if (!window.electronAPI) return;
    const res = await window.electronAPI.saveFile(filePath, code);
    if (res) {
      setFilePath(res.filePath);
    }
  };

  const handleExportPdf = async () => {
    if (!window.electronAPI) return;
    const suggestedName = filePath
      ? filePath.split('/').pop()?.replace('.typ', '.pdf')
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
          onOpenFileByPath={handleOpenFileByPath}
          onInsertSnippet={handleInsertSnippet}
          onSelectHeading={handleJumpToLine}
          onOpenTemplates={() => setIsTemplatesOpen(true)}
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

      {/* Template Gallery Modal */}
      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  );
};

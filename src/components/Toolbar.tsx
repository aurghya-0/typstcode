import React from 'react';
import {
  Play,
  FileCode,
  FilePlus,
  FolderOpen,
  FolderPlus,
  Save,
  Download,
  FileType,
  Image,
  RefreshCw,
  Layout,
  Sparkles,
  Zap,
  BookOpen
} from 'lucide-react';

interface ToolbarProps {
  fileName: string | null;
  autoCompile: boolean;
  setAutoCompile: (val: boolean) => void;
  onCompile: () => void;
  isCompiling: boolean;
  onNewFile?: () => void;
  onOpen: () => void;
  onOpenFolder?: () => void;
  onOpenTemplates?: () => void;
  onSave: () => void;
  onExportPdf: () => void;
  onExportPng: () => void;
  viewMode: 'split' | 'editor' | 'preview';
  setViewMode: (mode: 'split' | 'editor' | 'preview') => void;
  compilationTimeMs: number | null;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  fileName,
  autoCompile,
  setAutoCompile,
  onCompile,
  isCompiling,
  onNewFile,
  onOpen,
  onOpenFolder,
  onOpenTemplates,
  onSave,
  onExportPdf,
  onExportPng,
  viewMode,
  setViewMode,
  compilationTimeMs
}) => {
  return (
    <header className="h-12 glass-toolbar flex items-center justify-between px-4 z-20 select-none border-b border-slate-800">
      {/* Left: App Logo & File Title */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2.5 py-1 rounded-md shadow-md shadow-blue-500/20">
          <img src="/favicon.png" alt="Logo" className="w-4 h-4 object-contain" />
          <span className="font-extrabold text-sm tracking-wide font-outfit">TYPSTCODE</span>
        </div>

        <div className="h-4 w-px bg-slate-800" />

        <div className="flex items-center space-x-1.5 text-xs text-slate-300 bg-slate-900/60 px-2.5 py-1 rounded-md border border-slate-800">
          <FileCode className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-medium truncate max-w-[180px]">
            {fileName ? fileName.split(/[/\\]/).pop() : 'untitled.typ'}
          </span>
        </div>
      </div>

      {/* Center: File Actions & Compilation Controls */}
      <div className="flex items-center space-x-2">
        {onNewFile && (
          <button
            onClick={onNewFile}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="New File (Ctrl+N)"
          >
            <FilePlus className="w-3.5 h-3.5 text-blue-400" />
            <span>New File</span>
          </button>
        )}

        {onOpenTemplates && (
          <button
            onClick={onOpenTemplates}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-indigo-300 bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-800/50 transition-all"
            title="Browse Starter Templates"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Templates</span>
          </button>
        )}

        <button
          onClick={onOpen}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Open Typst File (Ctrl+O)"
        >
          <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>Open File</span>
        </button>

        {onOpenFolder && (
          <button
            onClick={onOpenFolder}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/50 transition-all"
            title="Open Workspace Folder"
          >
            <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
            <span>Open Folder</span>
          </button>
        )}

        <button
          onClick={onSave}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Save File (Ctrl+S)"
        >
          <Save className="w-3.5 h-3.5 text-emerald-400" />
          <span>Save</span>
        </button>

        <div className="h-4 w-px bg-slate-800 mx-1" />

        {/* Auto Compile Toggle */}
        <button
          onClick={() => setAutoCompile(!autoCompile)}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-all ${
            autoCompile
              ? 'bg-blue-950/60 text-blue-300 border-blue-800/80 shadow-sm shadow-blue-500/10'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
          title="Toggle live auto-compilation on edit"
        >
          <Zap className={`w-3.5 h-3.5 ${autoCompile ? 'text-blue-400' : 'text-slate-500'}`} />
          <span>Auto-Compile</span>
        </button>

        {/* Compile Button */}
        <button
          onClick={onCompile}
          disabled={isCompiling}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 transition-all shadow-md shadow-blue-600/20 disabled:opacity-50"
          title="Compile Document (Ctrl+Enter)"
        >
          {isCompiling ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
          <span>{isCompiling ? 'Compiling...' : 'Compile'}</span>
        </button>

        {compilationTimeMs !== null && (
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
            {compilationTimeMs}ms
          </span>
        )}
      </div>

      {/* Right: Layout Switcher & Export */}
      <div className="flex items-center space-x-2">
        {/* Layout Mode */}
        <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setViewMode('editor')}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              viewMode === 'editor' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Editor Only"
          >
            Code
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              viewMode === 'split' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Split Editor & Preview"
          >
            Split
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              viewMode === 'preview' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Preview Only"
          >
            Preview
          </button>
        </div>

        <div className="h-4 w-px bg-slate-800" />

        {/* Export Buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={onExportPdf}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Export as PDF"
          >
            <FileType className="w-3.5 h-3.5 text-rose-400" />
            <span>PDF</span>
          </button>
          <button
            onClick={onExportPng}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Export as PNG Image"
          >
            <Image className="w-3.5 h-3.5 text-cyan-400" />
            <span>PNG</span>
          </button>
        </div>
      </div>
    </header>
  );
};

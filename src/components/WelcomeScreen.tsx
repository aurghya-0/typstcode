import React from 'react';
import { Sparkles, FilePlus, FolderOpen, FolderPlus, BookOpen } from 'lucide-react';

interface WelcomeScreenProps {
  onNewFile: () => void;
  onOpenFile: () => void;
  onOpenFolder: () => void;
  onOpenTemplates?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onNewFile,
  onOpenFile,
  onOpenFolder,
  onOpenTemplates,
}) => {
  return (
    <div className="flex-1 h-full flex flex-col items-center justify-center p-8 bg-[#07090e] select-none text-slate-200 overflow-y-auto">
      <div className="max-w-xl w-full flex flex-col items-center text-center space-y-8">
        {/* Logo and Hero Header */}
        <div className="flex flex-col items-center space-y-3">
          <div className="p-3.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl shadow-xl shadow-blue-500/20 ring-1 ring-white/20">
            <img src="/favicon.png" alt="TypstCode Icon" className="w-12 h-12 object-contain" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-outfit">
            TypstCode
          </h1>
          <p className="text-sm text-slate-400 max-w-sm">
            A fast, modern Typst document editor with instant live preview
          </p>
        </div>

        {/* Primary Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 w-full">
          <button
            onClick={onNewFile}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/80 hover:bg-blue-950/40 border border-slate-800 hover:border-blue-500/50 transition-all group shadow-lg shadow-black/40"
          >
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform mb-2">
              <FilePlus className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-200 group-hover:text-blue-300">
              New File
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5">Start blank</span>
          </button>

          {onOpenTemplates && (
            <button
              onClick={onOpenTemplates}
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/80 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/50 transition-all group shadow-lg shadow-black/40"
            >
              <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform mb-2">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300">
                Templates
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">Starter gallery</span>
            </button>
          )}

          <button
            onClick={onOpenFile}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/80 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-500/50 transition-all group shadow-lg shadow-black/40"
          >
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform mb-2">
              <FolderOpen className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-200 group-hover:text-amber-300">
              Open File
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5">Open .typ file</span>
          </button>

          <button
            onClick={onOpenFolder}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/80 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500/50 transition-all group shadow-lg shadow-black/40"
          >
            <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform mb-2">
              <FolderPlus className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-200 group-hover:text-purple-300">
              Open Folder
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5">Open workspace</span>
          </button>
        </div>

        {/* Keyboard Shortcuts Section */}
        <div className="w-full bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 text-left space-y-2.5">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Quick Shortcuts
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between p-1.5 rounded bg-slate-950/60 border border-slate-800/50">
              <span className="text-slate-400">New File</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 rounded border border-slate-700">
                Ctrl + N
              </kbd>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded bg-slate-950/60 border border-slate-800/50">
              <span className="text-slate-400">Open File</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 rounded border border-slate-700">
                Ctrl + O
              </kbd>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded bg-slate-950/60 border border-slate-800/50">
              <span className="text-slate-400">Save File</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 rounded border border-slate-700">
                Ctrl + S
              </kbd>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded bg-slate-950/60 border border-slate-800/50">
              <span className="text-slate-400">Compile</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 rounded border border-slate-700">
                Ctrl + Enter
              </kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

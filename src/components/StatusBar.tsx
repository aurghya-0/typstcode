import React from 'react';
import { CheckCircle2, AlertCircle, RefreshCw, Cpu, FileText } from 'lucide-react';

interface StatusBarProps {
  cursorPosition: { line: number; column: number };
  code: string;
  isCompiling: boolean;
  hasError: boolean;
  compilationTimeMs: number | null;
  typstVersion: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  cursorPosition,
  code,
  isCompiling,
  hasError,
  compilationTimeMs,
  typstVersion
}) => {
  const lineCount = code.split('\n').length;
  const charCount = code.length;

  return (
    <footer className="h-6 bg-[#090d16] border-t border-slate-800/80 flex items-center justify-between px-3 text-[11px] text-slate-400 select-none z-20 font-mono">
      {/* Left: Compiler Status */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5">
          {isCompiling ? (
            <>
              <RefreshCw className="w-3 h-3 text-blue-400 animate-spin" />
              <span className="text-blue-300">Compiling...</span>
            </>
          ) : hasError ? (
            <>
              <AlertCircle className="w-3 h-3 text-rose-400" />
              <span className="text-rose-300">Build Failed</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span className="text-slate-300">Ready</span>
            </>
          )}
        </div>

        {compilationTimeMs !== null && !isCompiling && (
          <span className="text-slate-500">({compilationTimeMs}ms)</span>
        )}
      </div>

      {/* Right: Document & Cursor Telemetry */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1 text-slate-400">
          <FileText className="w-3 h-3 text-slate-500" />
          <span>{lineCount} Lines</span>
          <span className="text-slate-600">•</span>
          <span>{charCount} Chars</span>
        </div>

        <div className="h-3 w-px bg-slate-800" />

        <div className="text-slate-300 font-medium">
          Ln {cursorPosition.line}, Col {cursorPosition.column}
        </div>

        <div className="h-3 w-px bg-slate-800" />

        <div className="flex items-center space-x-1 text-blue-400/90 font-sans font-medium">
          <Cpu className="w-3 h-3" />
          <span>{typstVersion || 'Typst Native'}</span>
        </div>
      </div>
    </footer>
  );
};

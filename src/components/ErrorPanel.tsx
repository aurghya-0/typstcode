import React from 'react';
import { AlertOctagon, ChevronDown, ChevronUp, Terminal } from 'lucide-react';

interface Diagnostic {
  line: number;
  column: number;
  message: string;
  hint?: string;
}

interface ErrorPanelProps {
  diagnostics: Diagnostic[];
  onSelectDiagnostic: (line: number, column: number) => void;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

export const ErrorPanel: React.FC<ErrorPanelProps> = ({
  diagnostics,
  onSelectDiagnostic,
  isOpen,
  setIsOpen
}) => {
  if (diagnostics.length === 0) return null;

  return (
    <div className="w-full bg-[#0b0f19] border-t border-rose-900/40 select-none z-20 flex flex-col transition-all">
      {/* Panel Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 bg-rose-950/30 px-4 flex items-center justify-between cursor-pointer border-b border-rose-900/20 hover:bg-rose-950/50 transition-colors"
      >
        <div className="flex items-center space-x-2 text-xs font-semibold text-rose-300">
          <AlertOctagon className="w-4 h-4 text-rose-400" />
          <span>Typst Diagnostics ({diagnostics.length} {diagnostics.length === 1 ? 'Error' : 'Errors'})</span>
        </div>

        <button className="text-slate-400 hover:text-white">
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {/* Diagnostics List */}
      {isOpen && (
        <div className="max-h-40 overflow-y-auto p-2 space-y-1 font-mono text-xs bg-[#07090e]">
          {diagnostics.map((diag, index) => (
            <div
              key={index}
              onClick={() => onSelectDiagnostic(diag.line, diag.column)}
              className="flex items-start space-x-3 p-2 rounded bg-rose-950/20 hover:bg-rose-900/30 border border-rose-900/30 text-rose-200 cursor-pointer transition-colors group"
            >
              <Terminal className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-rose-100 group-hover:text-white">
                  {diag.message}
                </p>
                {diag.hint && <p className="text-[11px] text-rose-300/80 mt-0.5">{diag.hint}</p>}
              </div>
              <span className="bg-rose-900/50 px-2 py-0.5 rounded text-[10px] text-rose-200 font-bold border border-rose-800/60 shrink-0">
                Line {diag.line}:{diag.column}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

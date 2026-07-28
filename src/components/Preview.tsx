import React, { useState, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Layers,
  Sparkles
} from 'lucide-react';

interface PreviewProps {
  pages: string[];
  isCompiling: boolean;
  error: string | null;
  compilationTimeMs: number | null;
}

export const Preview: React.FC<PreviewProps> = ({
  pages,
  isCompiling,
  error,
  compilationTimeMs
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const [activePage, setActivePage] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 15, 250));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 15, 40));
  const handleResetZoom = () => setZoom(100);

  return (
    <div className="w-full h-full flex flex-col bg-[#07090e] border-l border-slate-800/80 relative overflow-hidden">
      {/* Top Floating Controls Bar */}
      <div className="h-10 glass-panel border-b border-slate-800/80 flex items-center justify-between px-4 z-10 select-none">
        <div className="flex items-center space-x-2 text-xs text-slate-300">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-medium">Live Preview</span>
          {pages.length > 0 && (
            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px] font-mono border border-slate-700">
              {pages.length} {pages.length === 1 ? 'Page' : 'Pages'}
            </span>
          )}
        </div>

        {/* Zoom & Page Navigation */}
        <div className="flex items-center space-x-2">
          {pages.length > 1 && (
            <div className="flex items-center bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-xs text-slate-300 space-x-1 mr-2">
              <button
                onClick={() => setActivePage((p) => Math.max(1, p - 1))}
                disabled={activePage <= 1}
                className="hover:text-white disabled:opacity-30 p-0.5"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px]">
                {activePage} / {pages.length}
              </span>
              <button
                onClick={() => setActivePage((p) => Math.min(pages.length, p + 1))}
                disabled={activePage >= pages.length}
                className="hover:text-white disabled:opacity-30 p-0.5"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center bg-slate-900 rounded border border-slate-800 p-0.5 space-x-1">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleResetZoom}
              className="px-2 text-[11px] font-mono text-slate-300 hover:text-white transition-colors"
              title="Reset Zoom (100%)"
            >
              {zoom}%
            </button>

            <button
              onClick={handleZoomIn}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Pages Canvas Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-6 flex flex-col items-center justify-start space-y-8 bg-[#090d16] scroll-smooth"
      >
        {isCompiling && pages.length === 0 && (
          <div className="my-auto flex flex-col items-center justify-center space-y-3 text-slate-400">
            <Sparkles className="w-8 h-8 text-blue-400 animate-spin" />
            <p className="text-sm font-medium">Compiling Typst document...</p>
          </div>
        )}

        {error && pages.length === 0 && (
          <div className="my-auto max-w-md bg-rose-950/40 border border-rose-800/80 rounded-xl p-5 text-center flex flex-col items-center space-y-3 shadow-xl">
            <AlertTriangle className="w-10 h-10 text-rose-400" />
            <h3 className="text-sm font-semibold text-rose-200">Compilation Error</h3>
            <p className="text-xs text-rose-300/80 font-mono text-left bg-rose-950/80 p-3 rounded-lg border border-rose-900/60 overflow-x-auto max-w-full">
              {error}
            </p>
          </div>
        )}

        {!error && pages.length === 0 && !isCompiling && (
          <div className="my-auto text-center text-slate-500 flex flex-col items-center space-y-2">
            <Layers className="w-10 h-10 text-slate-600 stroke-[1.5]" />
            <p className="text-sm font-medium text-slate-400">No Pages Rendered</p>
            <p className="text-xs text-slate-600">Type inside the editor to generate live preview</p>
          </div>
        )}

        {/* SVG Pages Render */}
        {pages.map((svgContent, index) => (
          <div
            key={index}
            className={`transition-transform duration-150 ease-out origin-top typst-svg-container shadow-2xl rounded-sm ${
              pages.length > 1 && index + 1 !== activePage ? 'hidden' : ''
            }`}
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              marginBottom: zoom !== 100 ? `${(zoom - 100) * 4}px` : undefined
            }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ))}
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import {
  Folder,
  FolderOpen,
  FolderPlus,
  FileCode,
  FileText,
  Image as ImageIcon,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  CornerLeftUp,
  RefreshCw,
  Code2,
  ListTree,
  BookOpen,
  Heading,
  Sigma,
  Table,
  Files
} from 'lucide-react';

interface FileItem {
  name: string;
  isDirectory: boolean;
  path: string;
}

interface SidebarProps {
  code: string;
  activeFilePath: string | null;
  currentDirPath: string;
  files: FileItem[];
  isLoadingFiles: boolean;
  onLoadDirectory: (dirPath?: string) => void;
  onOpenFileByPath: (filePath: string) => void;
  onInsertSnippet: (snippet: string) => void;
  onSelectHeading: (lineNumber: number) => void;
  onOpenTemplates: () => void;
  onOpenFolder: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  code,
  activeFilePath,
  currentDirPath,
  files,
  isLoadingFiles,
  onLoadDirectory,
  onOpenFileByPath,
  onInsertSnippet,
  onSelectHeading,
  onOpenTemplates,
  onOpenFolder,
  isCollapsed,
  setIsCollapsed
}) => {
  const [activeTab, setActiveTab] = useState<'files' | 'outline' | 'snippets'>('files');

  const handleNavigateUp = () => {
    if (!currentDirPath) return;
    const lastIdx = Math.max(currentDirPath.lastIndexOf('/'), currentDirPath.lastIndexOf('\\'));
    if (lastIdx > 0) {
      const parentDir = currentDirPath.substring(0, lastIdx);
      onLoadDirectory(parentDir);
    }
  };

  // Extract headings from Typst source code
  const extractHeadings = (typstCode: string) => {
    const lines = typstCode.split('\n');
    const headings: Array<{ level: number; title: string; line: number }> = [];

    lines.forEach((lineText, idx) => {
      const match = lineText.match(/^(=+)\s+(.+)$/);
      if (match) {
        headings.push({
          level: match[1].length,
          title: match[2].trim(),
          line: idx + 1
        });
      }
    });

    return headings;
  };

  const headings = extractHeadings(code);

  const getFileIcon = (fileName: string, isDirectory: boolean) => {
    if (isDirectory) return <Folder className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    if (fileName.endsWith('.typ')) return <FileCode className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
    if (fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.svg')) {
      return <ImageIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
    }
    return <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
  };

  const SNIPPET_CATEGORIES = [
    {
      category: 'Headings & Sections',
      icon: Heading,
      snippets: [
        { label: 'Level 1 Heading', code: '\n= Main Section\n' },
        { label: 'Level 2 Heading', code: '\n== Subsection\n' },
        { label: 'Level 3 Heading', code: '\n=== Sub-subsection\n' }
      ]
    },
    {
      category: 'Math & Formulas',
      icon: Sigma,
      snippets: [
        { label: 'Inline Math', code: '$ E = m c^2 $' },
        { label: 'Block Equation', code: '\n$ sum_(i=1)^n x_i = frac(n(n+1), 2) $\n' },
        { label: 'Matrix (2x2)', code: '$ mat(a, b; c, d) $' },
        { label: 'Integral', code: '$ int_a^b f(x) dx $' }
      ]
    },
    {
      category: 'Tables & Layout',
      icon: Table,
      snippets: [
        {
          label: 'Data Table',
          code: `\n#table(
  columns: (1fr, 1fr),
  [*Header 1*], [*Header 2*],
  [Cell 1], [Cell 2]
)\n`
        },
        {
          label: '2-Column Grid',
          code: `\n#grid(
  columns: (1fr, 1fr),
  gutter: 12pt,
  [Left content],
  [Right content]
)\n`
        }
      ]
    }
  ];

  if (isCollapsed) {
    return (
      <div className="w-10 bg-[#07090e] border-r border-slate-800/80 flex flex-col items-center py-3 space-y-4 z-10 select-none">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
          title="Expand Sidebar"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <div className="w-4 h-px bg-slate-800" />
        <button
          onClick={() => {
            setIsCollapsed(false);
            setActiveTab('files');
          }}
          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
          title="File Explorer"
        >
          <Files className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setIsCollapsed(false);
            setActiveTab('outline');
          }}
          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
          title="Document Outline"
        >
          <ListTree className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setIsCollapsed(false);
            setActiveTab('snippets');
          }}
          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
          title="Snippets Palette"
        >
          <Code2 className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <aside className="w-64 bg-[#07090e] border-r border-slate-800/80 flex flex-col h-full z-10 select-none">
      {/* Navigation Header Tabs */}
      <div className="h-10 border-b border-slate-800/80 flex items-center justify-between px-2 bg-slate-950/60">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('files')}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
              activeTab === 'files'
                ? 'bg-slate-800 text-blue-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Files Explorer"
          >
            <Files className="w-3.5 h-3.5" />
            <span>Files</span>
          </button>

          <button
            onClick={() => setActiveTab('outline')}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
              activeTab === 'outline'
                ? 'bg-slate-800 text-blue-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Document Outline"
          >
            <ListTree className="w-3.5 h-3.5" />
            <span>Outline</span>
          </button>

          <button
            onClick={() => setActiveTab('snippets')}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
              activeTab === 'snippets'
                ? 'bg-slate-800 text-blue-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Snippets Palette"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Snippets</span>
          </button>
        </div>

        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
          title="Collapse Sidebar"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Main Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* FILES EXPLORER TAB */}
        {activeTab === 'files' && (
          <div className="space-y-2">
            {/* Header / Current Open Folder & Actions */}
            <div className="flex flex-col space-y-1.5 px-1 pb-2 border-b border-slate-800/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 overflow-hidden">
                  <FolderOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-[11px] font-semibold text-slate-200 truncate max-w-[110px]" title={currentDirPath || 'Explorer'}>
                    {currentDirPath ? currentDirPath.split(/[/\\]/).pop() : 'Explorer'}
                  </span>
                </div>

                <div className="flex items-center space-x-1">
                  {currentDirPath && (
                    <button
                      onClick={handleNavigateUp}
                      className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                      title="Parent Folder (Up)"
                    >
                      <CornerLeftUp className="w-3 h-3 text-slate-400" />
                    </button>
                  )}

                  <button
                    onClick={onOpenFolder}
                    className="flex items-center space-x-1 px-1.5 py-0.5 bg-amber-950/50 hover:bg-amber-900/70 border border-amber-800/60 text-amber-300 rounded text-[10px] font-semibold transition-all shadow-sm"
                    title="Open Workspace Folder"
                  >
                    <FolderPlus className="w-3 h-3 text-amber-400" />
                    <span>Open</span>
                  </button>

                  <button
                    onClick={() => onLoadDirectory(currentDirPath)}
                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                    title="Refresh Folder"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Display full open folder path */}
              {currentDirPath && (
                <div
                  className="text-[10px] text-slate-400 truncate bg-slate-900/80 px-2 py-1 rounded border border-slate-800/80 font-mono tracking-tight"
                  title={currentDirPath}
                >
                  {currentDirPath}
                </div>
              )}
            </div>

            {/* File List Tree */}
            <div className="space-y-0.5">
              {files.length === 0 && !isLoadingFiles && (
                <div className="p-4 text-center space-y-2.5 border border-dashed border-slate-800/80 rounded-lg my-2 bg-slate-950/40">
                  <Folder className="w-8 h-8 text-slate-600 mx-auto stroke-[1.5]" />
                  <div className="text-xs text-slate-400 font-medium">No folder open</div>
                  <button
                    onClick={onOpenFolder}
                    className="px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-950/80 hover:bg-amber-900/90 border border-amber-800/70 rounded-md transition-all inline-flex items-center space-x-1.5 shadow-sm"
                  >
                    <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
                    <span>Open Folder</span>
                  </button>
                </div>
              )}

              {files.map((file) => {
                const isActive = activeFilePath === file.path;
                return (
                  <button
                    key={file.path}
                    onClick={() => {
                      if (file.isDirectory) {
                        onLoadDirectory(file.path);
                      } else {
                        onOpenFileByPath(file.path);
                      }
                    }}
                    className={`w-full text-left flex items-center space-x-2 px-2 py-1.5 rounded text-xs transition-colors group ${
                      isActive
                        ? 'bg-blue-600/20 text-blue-300 font-medium border border-blue-500/30'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    {getFileIcon(file.name, file.isDirectory)}
                    <span className="truncate flex-1">{file.name}</span>
                    {file.isDirectory && (
                      <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* OUTLINE TAB */}
        {activeTab === 'outline' && (
          <div className="space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
              Headings Navigation
            </div>

            {headings.length === 0 ? (
              <div className="text-xs text-slate-500 italic p-2 border border-dashed border-slate-800 rounded text-center">
                No headings found in current file
              </div>
            ) : (
              headings.map((h, i) => (
                <button
                  key={i}
                  onClick={() => onSelectHeading(h.line)}
                  className="w-full text-left flex items-center space-x-2 px-2 py-1.5 rounded text-xs text-slate-300 hover:bg-slate-800/80 hover:text-blue-400 transition-colors group"
                  style={{ paddingLeft: `${(h.level - 1) * 10 + 8}px` }}
                >
                  <span className="text-slate-500 font-mono text-[10px]">L{h.line}</span>
                  <span className="truncate flex-1">{h.title}</span>
                </button>
              ))
            )}
          </div>
        )}

        {/* SNIPPETS TAB */}
        {activeTab === 'snippets' && (
          <div className="space-y-4">
            {SNIPPET_CATEGORIES.map((cat, idx) => {
              const IconComp = cat.icon;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 px-1">
                    <IconComp className="w-3.5 h-3.5 text-blue-400" />
                    <span>{cat.category}</span>
                  </div>

                  <div className="space-y-1">
                    {cat.snippets.map((snip, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => onInsertSnippet(snip.code)}
                        className="w-full text-left px-2.5 py-1.5 rounded text-xs bg-slate-900/60 hover:bg-blue-950/40 hover:border-blue-800/60 border border-slate-800/80 text-slate-300 hover:text-blue-300 transition-all flex items-center justify-between"
                      >
                        <span>{snip.label}</span>
                        <span className="text-[10px] font-mono text-slate-500">+Insert</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Template Quick Trigger */}
      <div className="p-2 border-t border-slate-800/80 bg-slate-950/80">
        <button
          onClick={onOpenTemplates}
          className="w-full flex items-center justify-center space-x-2 py-1.5 px-3 bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-800/60 rounded-lg text-xs font-medium text-indigo-300 transition-all shadow-sm"
        >
          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
          <span>Browse Templates</span>
        </button>
      </div>
    </aside>
  );
};

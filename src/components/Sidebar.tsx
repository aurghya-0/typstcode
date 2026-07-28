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
  onOpenFolder: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  currentLine?: number;
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
  onOpenFolder,
  isCollapsed,
  setIsCollapsed,
  currentLine
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

  // Clean Typst markup tags for clean display in outline UI
  const cleanTypstMarkup = (text: string): string => {
    return text
      // Remove labels at end <label>
      .replace(/\s*<[a-zA-Z0-9_:-]+>\s*$/, '')
      // Remove #text(...)[content] or #text[content] -> content
      .replace(/#text\([^)]*\)\[([^\]]+)\]/g, '$1')
      .replace(/#text\[([^\]]+)\]/g, '$1')
      // Remove #emph[content] -> content
      .replace(/#emph\[([^\]]+)\]/g, '$1')
      // Remove #strong[content] -> content
      .replace(/#strong\[([^\]]+)\]/g, '$1')
      // Remove #smallcaps[content] -> content
      .replace(/#smallcaps\[([^\]]+)\]/g, '$1')
      // Remove *bold* -> bold
      .replace(/\*([^*]+)\*/g, '$1')
      // Remove _italic_ -> italic
      .replace(/_([^_]+)_/g, '$1')
      // Remove `code` -> code
      .replace(/`([^`]+)`/g, '$1')
      // Remove leading/trailing brackets
      .replace(/^\[(.*)\]$/, '$1')
      .trim();
  };

  // Extract headings from Typst source code
  const extractHeadings = (typstCode: string) => {
    const lines = typstCode.split('\n');
    const headings: Array<{ level: number; title: string; line: number }> = [];
    let inBlockComment = false;
    let inRawBlock = false;

    lines.forEach((lineText, idx) => {
      const trimmed = lineText.trim();

      if (trimmed.startsWith('```')) {
        inRawBlock = !inRawBlock;
        return;
      }
      if (inRawBlock) return;

      if (trimmed.startsWith('/*')) {
        inBlockComment = true;
      }
      if (inBlockComment) {
        if (trimmed.endsWith('*/') || trimmed.includes('*/')) {
          inBlockComment = false;
        }
        return;
      }

      if (trimmed.startsWith('//')) return;

      // 1. Equal sign markup headings: = Title, == Subtitle, etc.
      const markupMatch = lineText.match(/^\s*(=+)\s+(.+)$/);
      if (markupMatch) {
        const level = markupMatch[1].length;
        const rawTitle = markupMatch[2].trim();
        const title = cleanTypstMarkup(rawTitle);
        headings.push({
          level,
          title: title || rawTitle,
          line: idx + 1
        });
        return;
      }

      // 2. Function-style headings: #heading[Title] or #heading(level: 2)[Title]
      const funcMatch = lineText.match(/^\s*#heading\s*(?:\(([^)]*)\))?\s*\[(.*)\]\s*$/);
      if (funcMatch) {
        const args = funcMatch[1] || '';
        const rawTitle = funcMatch[2].trim();
        let level = 1;
        const levelMatch = args.match(/level\s*:\s*(\d+)/);
        if (levelMatch) {
          level = parseInt(levelMatch[1], 10) || 1;
        }
        const title = cleanTypstMarkup(rawTitle);
        headings.push({
          level,
          title: title || rawTitle,
          line: idx + 1
        });
      }
    });

    return headings;
  };

  const headings = extractHeadings(code);

  // Determine active heading index based on currentLine
  let activeHeadingIndex = -1;
  if (currentLine && headings.length > 0) {
    for (let i = headings.length - 1; i >= 0; i--) {
      if (headings[i].line <= currentLine) {
        activeHeadingIndex = i;
        break;
      }
    }
  }

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
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
              <span>Headings Navigation</span>
              {headings.length > 0 && (
                <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                  {headings.length}
                </span>
              )}
            </div>

            {headings.length === 0 ? (
              <div className="text-xs text-slate-500 italic p-3 border border-dashed border-slate-800/80 rounded-lg text-center bg-slate-950/40 space-y-1">
                <p>No headings found in current file</p>
                <p className="text-[10px] text-slate-600 not-italic">Use = Section or == Subsection to create headings</p>
              </div>
            ) : (
              headings.map((h, i) => {
                const isActive = activeHeadingIndex === i;
                return (
                  <button
                    key={i}
                    onClick={() => onSelectHeading(h.line)}
                    className={`w-full text-left flex items-center space-x-2 px-2 py-1.5 rounded text-xs transition-all group ${
                      isActive
                        ? 'bg-blue-600/20 text-blue-300 font-medium border border-blue-500/30 shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-blue-400'
                    }`}
                    style={{ paddingLeft: `${Math.max(0, h.level - 1) * 12 + 8}px` }}
                  >
                    <span
                      className={`text-[9px] font-bold px-1 py-0.5 rounded font-mono shrink-0 ${
                        isActive
                          ? 'bg-blue-500/30 text-blue-200'
                          : 'bg-slate-800/80 text-slate-400 group-hover:bg-blue-950 group-hover:text-blue-300'
                      }`}
                    >
                      H{h.level}
                    </span>
                    <span className="truncate flex-1">{h.title}</span>
                    <span className="text-[10px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      :{h.line}
                    </span>
                  </button>
                );
              })
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
    </aside>
  );
};

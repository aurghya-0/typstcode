import type { Monaco } from '@monaco-editor/react';

export function registerTypstLanguage(monaco: Monaco) {
  // Register language ID if not already registered
  if (!monaco.languages.getLanguages().some((lang: { id: string }) => lang.id === 'typst')) {
    monaco.languages.register({ id: 'typst' });
  }

  // Set Language Configuration for auto-closing brackets and comments
  monaco.languages.setLanguageConfiguration('typst', {
    comments: {
      lineComment: '//',
      blockComment: ['/*', '*/'],
    },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')'],
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: '$', close: '$' },
      { open: '*', close: '*' },
      { open: '_', close: '_' },
      { open: '`', close: '`' },
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: '$', close: '$' },
      { open: '*', close: '*' },
      { open: '_', close: '_' },
      { open: '`', close: '`' },
    ],
  });

  // Define Monarch Tokens for Typst Syntax Highlighting
  monaco.languages.setMonarchTokensProvider('typst', {
    defaultToken: '',
    tokenPostfix: '.typ',

    keywords: [
      'let', 'set', 'show', 'import', 'include', 'return', 'if', 'else', 'for',
      'while', 'in', 'break', 'continue', 'as', 'context', 'none', 'auto', 'true', 'false'
    ],

    builtins: [
      'heading', 'text', 'par', 'page', 'align', 'v', 'h', 'grid', 'table', 'image',
      'rect', 'circle', 'square', 'ellipse', 'line', 'polygon', 'path', 'place',
      'block', 'box', 'columns', 'colbreak', 'pagebreak', 'counter', 'state', 'query',
      'locate', 'measure', 'lorem', 'rgb', 'cmyk', 'luma', 'range', 'int', 'float',
      'str', 'type', 'repr', 'calc', 'smallcaps', 'emph', 'strong'
    ],

    tokenizer: {
      root: [
        // Headings: = Section
        [/^=+\s+.*$/, 'keyword.heading'],

        // Comments
        [/\/\/.*/, 'comment'],
        [/\/\*/, 'comment', '@comment'],

        // Typst Directives / Hash Functions: #let, #import, #show, #text(...)
        [/#(let|set|show|import|include|context|if|else|for|while|in|return)\b/, 'keyword'],
        [/#([a-zA-Z0-9_-]+)/, 'type.identifier'],

        // Strings
        [/"([^"\\]|\\.)*"/, 'string'],

        // Math Mode: $ ... $
        [/\$([^$]|\\\$)*\$/, 'string.math'],

        // Formatting: *bold*, _italic_, `code`
        [/\*[^\*]+\*/, 'strong'],
        [/_[^_]+_/, 'emphasis'],
        [/`[^`]+`/, 'variable.source'],

        // Numbers
        [/\b\d+(\.\d+)?(pt|mm|cm|in|em|rem|deg|rad|%|fr)?\b/, 'number'],

        // Label / Reference: <label>, @ref
        [/<[a-zA-Z0-9_-]+>/, 'tag'],
        [/@[a-zA-Z0-9_-]+/, 'tag'],

        // Bracket matching
        [/[{}()\[\]]/, '@brackets'],
      ],

      comment: [
        [/[^\/*]+/, 'comment'],
        [/\/\*/, 'comment', '@push'],
        ["\\*/", 'comment', '@pop'],
        [/[\/*]/, 'comment']
      ],
    },
  });

  // Define Custom Typst Dark Theme for Monaco Editor
  monaco.editor.defineTheme('typst-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword.heading', foreground: '60A5FA', fontStyle: 'bold' },
      { token: 'keyword', foreground: 'F472B6', fontStyle: 'bold' },
      { token: 'type.identifier', foreground: '38BDF8' },
      { token: 'comment', foreground: '64748B', fontStyle: 'italic' },
      { token: 'string', foreground: '34D399' },
      { token: 'string.math', foreground: 'FBBF24' },
      { token: 'strong', foreground: 'F8FAFC', fontStyle: 'bold' },
      { token: 'emphasis', foreground: 'E2E8F0', fontStyle: 'italic' },
      { token: 'number', foreground: 'C084FC' },
      { token: 'tag', foreground: 'FB7185' },
    ],
    colors: {
      'editor.background': '#0b0f19',
      'editor.foreground': '#f8fafc',
      'editor.lineHighlightBackground': '#1e293b55',
      'editorCursor.foreground': '#38bdf8',
      'editorWhitespace.foreground': '#334155',
      'editorIndentGuide.background': '#1e293b',
      'editorIndentGuide.activeBackground': '#334155',
      'editor.selectionBackground': '#2563eb44',
    },
  });
}

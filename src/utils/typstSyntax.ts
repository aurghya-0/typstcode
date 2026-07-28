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

  // Register Typst Completion Item Provider for Rich Autocomplete
  registerCompletionItems(monaco);
}

let completionProviderDisposable: any = null;

function registerCompletionItems(monaco: Monaco) {
  if (completionProviderDisposable) return;

  const K = monaco.languages.CompletionItemKind;

  const COMPLETIONS = [
    // Directives & Statements (#let, #set, #show, #import, #if, etc.)
    {
      label: '#let variable',
      kind: K.Snippet,
      detail: 'Variable Binding',
      documentation: 'Declare a new Typst variable',
      insertText: '#let ${1:name} = ${2:value}'
    },
    {
      label: '#let function',
      kind: K.Snippet,
      detail: 'Function Definition',
      documentation: 'Declare a custom Typst function',
      insertText: '#let ${1:func}(${2:arg}) = {\n  ${3:body}\n}'
    },
    {
      label: '#set page',
      kind: K.Snippet,
      detail: 'Page Layout Setup',
      documentation: 'Configure page size, paper, margins, and headers',
      insertText: '#set page(\n  paper: "${1:a4}",\n  margin: (x: ${2:2cm}, y: ${3:2.5cm}),\n)'
    },
    {
      label: '#set text',
      kind: K.Snippet,
      detail: 'Global Text Properties',
      documentation: 'Configure font family, size, fill color, and language',
      insertText: '#set text(\n  font: "${1:Liberation Sans}",\n  size: ${2:11pt},\n  fill: ${3:rgb("#1e293b")},\n)'
    },
    {
      label: '#set par',
      kind: K.Snippet,
      detail: 'Paragraph Formatting',
      documentation: 'Configure justification, line spacing, and indent',
      insertText: '#set par(\n  justify: ${1:true},\n  leading: ${2:0.65em},\n)'
    },
    {
      label: '#set align',
      kind: K.Snippet,
      detail: 'Alignment Rule',
      documentation: 'Set default content alignment (center, left, right, top, bottom)',
      insertText: '#set align(${1:center})'
    },
    {
      label: '#set heading',
      kind: K.Snippet,
      detail: 'Heading Numbering Rule',
      documentation: 'Configure automatic section numbering',
      insertText: '#set heading(numbering: "${1:1.1.}")'
    },
    {
      label: '#show heading',
      kind: K.Snippet,
      detail: 'Show Rule for Headings',
      documentation: 'Custom styling rule for all headings',
      insertText: '#show heading: ${1:it => block(fill: blue.lighten(90%), inset: 8pt, radius: 4pt, it)}'
    },
    {
      label: '#show selector',
      kind: K.Snippet,
      detail: 'Generic Show Rule',
      documentation: 'Transform or style matched elements',
      insertText: '#show ${1:selector}: ${2:transform}'
    },
    {
      label: '#import',
      kind: K.Keyword,
      detail: 'Module Import',
      documentation: 'Import symbols from another Typst file or package',
      insertText: '#import "${1:file.typ}": ${2:*}'
    },
    {
      label: '#include',
      kind: K.Keyword,
      detail: 'File Inclusion',
      documentation: 'Include document content from another file',
      insertText: '#include "${1:file.typ}"'
    },
    {
      label: '#if else',
      kind: K.Snippet,
      detail: 'Conditional Branch',
      documentation: 'Evaluate condition and render matching branch',
      insertText: '#if ${1:condition} [\n  ${2:content}\n] else [\n  ${3:alternate}\n]'
    },
    {
      label: '#for loop',
      kind: K.Snippet,
      detail: 'For Loop',
      documentation: 'Iterate over array items or range',
      insertText: '#for ${1:item} in ${2:array} [\n  ${3:content}\n]'
    },
    {
      label: '#while loop',
      kind: K.Snippet,
      detail: 'While Loop',
      documentation: 'Loop while condition evaluates to true',
      insertText: '#while ${1:condition} [\n  ${2:content}\n]'
    },
    {
      label: '#context',
      kind: K.Keyword,
      detail: 'Contextual Expression',
      documentation: 'Access contextual dynamic layout state',
      insertText: '#context ${1:expression}'
    },

    // Layout & Elements
    {
      label: 'heading',
      kind: K.Function,
      detail: 'Section Heading',
      documentation: 'Create a section heading',
      insertText: 'heading(level: ${1:1}, [${2:Title}])'
    },
    {
      label: 'text',
      kind: K.Function,
      detail: 'Text Styling',
      documentation: 'Apply inline text styles',
      insertText: 'text(size: ${1:12pt}, fill: ${2:blue})[${3:Text}]'
    },
    {
      label: 'align',
      kind: K.Function,
      detail: 'Align Content',
      documentation: 'Align child elements',
      insertText: 'align(${1:center})[${2:Content}]'
    },
    {
      label: 'v',
      kind: K.Function,
      detail: 'Vertical Spacing',
      documentation: 'Add vertical space',
      insertText: 'v(${1:1em})'
    },
    {
      label: 'h',
      kind: K.Function,
      detail: 'Horizontal Spacing',
      documentation: 'Add horizontal space',
      insertText: 'h(${1:1em})'
    },
    {
      label: 'grid',
      kind: K.Function,
      detail: 'Multi-column Grid Layout',
      documentation: 'Create a grid layout with columns and gutters',
      insertText: 'grid(\n  columns: (${1:1fr, 1fr}),\n  gutter: ${2:12pt},\n  [${3:Left}],\n  [${4:Right}],\n)'
    },
    {
      label: 'table',
      kind: K.Function,
      detail: 'Structured Table',
      documentation: 'Create a table with headers and data rows',
      insertText: 'table(\n  columns: (${1:1fr, 1fr}),\n  [*${2:Header 1}*], [*${3:Header 2}*],\n  [${4:Cell 1}], [${5:Cell 2}],\n)'
    },
    {
      label: 'image',
      kind: K.Function,
      detail: 'Embed Image',
      documentation: 'Embed PNG, JPG, or SVG image file',
      insertText: 'image("${1:image.png}", width: ${2:80%})'
    },
    {
      label: 'figure',
      kind: K.Function,
      detail: 'Caption Figure',
      documentation: 'Wrap image or table with numbered caption',
      insertText: 'figure(\n  image("${1:image.png}", width: ${2:80%}),\n  caption: [${3:Caption}],\n)'
    },
    {
      label: 'rect',
      kind: K.Function,
      detail: 'Rectangle Graphic',
      documentation: 'Draw filled or stroked rectangle',
      insertText: 'rect(width: ${1:100%}, height: ${2:20pt}, fill: ${3:blue.lighten(80%)})'
    },
    {
      label: 'circle',
      kind: K.Function,
      detail: 'Circle Graphic',
      documentation: 'Draw circle with specified radius',
      insertText: 'circle(radius: ${1:10pt}, fill: ${2:red})'
    },
    {
      label: 'square',
      kind: K.Function,
      detail: 'Square Graphic',
      documentation: 'Draw square with specified size',
      insertText: 'square(size: ${1:20pt})'
    },
    {
      label: 'line',
      kind: K.Function,
      detail: 'Line Graphic',
      documentation: 'Draw line segment',
      insertText: 'line(length: ${1:100%}, stroke: ${2:0.5pt + gray})'
    },
    {
      label: 'polygon',
      kind: K.Function,
      detail: 'Polygon Graphic',
      documentation: 'Draw multi-vertex polygon',
      insertText: 'polygon((${1:0pt, 0pt}), (${2:20pt, 40pt}), (${3:40pt, 0pt}))'
    },
    {
      label: 'place',
      kind: K.Function,
      detail: 'Absolute Placement',
      documentation: 'Place content at specific margin position',
      insertText: 'place(${1:top + right})[${2:Content}]'
    },
    {
      label: 'block',
      kind: K.Function,
      detail: 'Block Container',
      documentation: 'Wrap content in styled block',
      insertText: 'block(fill: ${1:luma(240)}, inset: ${2:8pt}, radius: ${3:4pt})[${4:Content}]'
    },
    {
      label: 'box',
      kind: K.Function,
      detail: 'Inline Box Container',
      documentation: 'Wrap content in inline box',
      insertText: 'box(stroke: ${1:1pt + blue}, inset: ${2:4pt})[${3:Content}]'
    },
    {
      label: 'columns',
      kind: K.Function,
      detail: 'Multi-column Flow',
      documentation: 'Flow body content into multi-column layout',
      insertText: 'columns(${1:2})[\n  ${2:Content}\n]'
    },
    {
      label: 'colbreak',
      kind: K.Function,
      detail: 'Column Break',
      documentation: 'Force column break in multi-column layout',
      insertText: 'colbreak()'
    },
    {
      label: 'pagebreak',
      kind: K.Function,
      detail: 'Page Break',
      documentation: 'Force page break',
      insertText: 'pagebreak()'
    },
    {
      label: 'counter',
      kind: K.Function,
      detail: 'State Counter',
      documentation: 'Access or manipulate document counters',
      insertText: 'counter(${1:page}).${2:display()}'
    },
    {
      label: 'lorem',
      kind: K.Function,
      detail: 'Placeholder Text',
      documentation: 'Generate N words of Lorem Ipsum filler text',
      insertText: 'lorem(${1:50})'
    },
    {
      label: 'rgb',
      kind: K.Function,
      detail: 'RGB Color',
      documentation: 'Define color from hex or RGB values',
      insertText: 'rgb("${1:#3b82f6}")'
    },

    // Typography & Formatting
    {
      label: 'strong',
      kind: K.Function,
      detail: 'Bold Formatting',
      documentation: 'Bold font weight',
      insertText: 'strong[${1:Bold text}]'
    },
    {
      label: 'emph',
      kind: K.Function,
      detail: 'Italic Formatting',
      documentation: 'Emphasized italic text',
      insertText: 'emph[${1:Italic text}]'
    },
    {
      label: 'smallcaps',
      kind: K.Function,
      detail: 'Small Caps',
      documentation: 'Small capital letters',
      insertText: 'smallcaps[${1:Small caps}]'
    },
    {
      label: 'link',
      kind: K.Function,
      detail: 'Hyperlink',
      documentation: 'Add clickable web URL hyperlink',
      insertText: 'link("${1:https://example.com}")[${2:Label}]'
    },
    {
      label: 'footnote',
      kind: K.Function,
      detail: 'Footnote',
      documentation: 'Insert numbered page footnote',
      insertText: 'footnote[${1:Footnote text}]'
    },
    {
      label: 'bibliography',
      kind: K.Function,
      detail: 'Reference Bibliography',
      documentation: 'Render works cited bibliography from .bib file',
      insertText: 'bibliography("${1:works.bib}")'
    },

    // Math Formulas & Symbols
    {
      label: 'frac',
      kind: K.Function,
      detail: 'Math Fraction',
      documentation: 'Numerator over denominator fraction',
      insertText: 'frac(${1:num}, ${2:den})'
    },
    {
      label: 'sum',
      kind: K.Function,
      detail: 'Summation Operator',
      documentation: 'Summation symbol with bounds',
      insertText: 'sum_(${1:i=1})^(${2:n}) ${3:x_i}'
    },
    {
      label: 'product',
      kind: K.Function,
      detail: 'Product Operator',
      documentation: 'Product symbol with bounds',
      insertText: 'product_(${1:i=1})^(${2:n}) ${3:x_i}'
    },
    {
      label: 'int',
      kind: K.Function,
      detail: 'Integral Operator',
      documentation: 'Definite integral with bounds',
      insertText: 'int_(${1:a})^(${2:b}) ${3:f(x)} d${4:x}'
    },
    {
      label: 'lim',
      kind: K.Function,
      detail: 'Limit Operator',
      documentation: 'Limit expression',
      insertText: 'lim_(${1:x -> 0}) ${2:f(x)}'
    },
    {
      label: 'sqrt',
      kind: K.Function,
      detail: 'Square Root',
      documentation: 'Square root radical',
      insertText: 'sqrt(${1:x})'
    },
    {
      label: 'root',
      kind: K.Function,
      detail: 'N-th Root',
      documentation: 'N-th order radical root',
      insertText: 'root(${1:n}, ${2:x})'
    },
    {
      label: 'mat',
      kind: K.Function,
      detail: 'Math Matrix',
      documentation: 'Matrix rows separated by semicolons',
      insertText: 'mat(${1:a, b; c, d})'
    },
    {
      label: 'vec',
      kind: K.Function,
      detail: 'Math Column Vector',
      documentation: 'Column vector',
      insertText: 'vec(${1:a, b, c})'
    },
    {
      label: 'cases',
      kind: K.Function,
      detail: 'Piecewise Cases',
      documentation: 'Piecewise function definition with braces',
      insertText: 'cases(${1:1 "if" x > 0, 0 "otherwise"})'
    },

    // Greek Math Symbols
    { label: 'alpha', kind: K.Value, detail: 'Greek α', insertText: 'alpha' },
    { label: 'beta', kind: K.Value, detail: 'Greek β', insertText: 'beta' },
    { label: 'gamma', kind: K.Value, detail: 'Greek γ', insertText: 'gamma' },
    { label: 'delta', kind: K.Value, detail: 'Greek δ', insertText: 'delta' },
    { label: 'epsilon', kind: K.Value, detail: 'Greek ε', insertText: 'epsilon' },
    { label: 'theta', kind: K.Value, detail: 'Greek θ', insertText: 'theta' },
    { label: 'lambda', kind: K.Value, detail: 'Greek λ', insertText: 'lambda' },
    { label: 'pi', kind: K.Value, detail: 'Greek π', insertText: 'pi' },
    { label: 'sigma', kind: K.Value, detail: 'Greek σ', insertText: 'sigma' },
    { label: 'omega', kind: K.Value, detail: 'Greek ω', insertText: 'omega' },
    { label: 'phi', kind: K.Value, detail: 'Greek φ', insertText: 'phi' },
    { label: 'psi', kind: K.Value, detail: 'Greek ψ', insertText: 'psi' },
    { label: 'Delta', kind: K.Value, detail: 'Greek Δ', insertText: 'Delta' },
    { label: 'Gamma', kind: K.Value, detail: 'Greek Γ', insertText: 'Gamma' },
    { label: 'Theta', kind: K.Value, detail: 'Greek Θ', insertText: 'Theta' },
    { label: 'Lambda', kind: K.Value, detail: 'Greek Λ', insertText: 'Lambda' },
    { label: 'Pi', kind: K.Value, detail: 'Greek Π', insertText: 'Pi' },
    { label: 'Sigma', kind: K.Value, detail: 'Greek Σ', insertText: 'Sigma' },
    { label: 'Omega', kind: K.Value, detail: 'Greek Ω', insertText: 'Omega' },

    // Math Operators & Relations
    { label: 'approx', kind: K.Value, detail: '≈ Approximation', insertText: 'approx' },
    { label: 'equiv', kind: K.Value, detail: '≡ Equivalence', insertText: 'equiv' },
    { label: 'neq', kind: K.Value, detail: '≠ Not Equal', insertText: 'neq' },
    { label: 'leq', kind: K.Value, detail: '≤ Less/Equal', insertText: 'leq' },
    { label: 'geq', kind: K.Value, detail: '≥ Greater/Equal', insertText: 'geq' },
    { label: 'subset', kind: K.Value, detail: '⊂ Subset', insertText: 'subset' },
    { label: 'supset', kind: K.Value, detail: '⊃ Superset', insertText: 'supset' },
    { label: 'in', kind: K.Value, detail: '∈ Element of', insertText: 'in' },
    { label: 'notin', kind: K.Value, detail: '∉ Not element of', insertText: 'notin' },
    { label: 'times', kind: K.Value, detail: '× Multiplication', insertText: 'times' },
    { label: 'div', kind: K.Value, detail: '÷ Division', insertText: 'div' },
    { label: 'pm', kind: K.Value, detail: '± Plus minus', insertText: 'pm' },
    { label: 'cdot', kind: K.Value, detail: '· Centered dot', insertText: 'cdot' },
    { label: 'arrow.r', kind: K.Value, detail: '→ Right arrow', insertText: 'arrow.r' },
    { label: 'arrow.l', kind: K.Value, detail: '← Left arrow', insertText: 'arrow.l' },
    { label: 'implies', kind: K.Value, detail: '⇒ Implies', insertText: 'implies' },
    { label: 'iff', kind: K.Value, detail: '⇔ If and only if', insertText: 'iff' },
    { label: 'infinity', kind: K.Value, detail: '∞ Infinity', insertText: 'infinity' },
  ];

  completionProviderDisposable = monaco.languages.registerCompletionItemProvider('typst', {
    triggerCharacters: ['#', '$', '.', ':', '(', '=', '@', '<'],
    provideCompletionItems: (model: any, position: any) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      };

      const suggestions = COMPLETIONS.map((item) => ({
        label: item.label,
        kind: item.kind,
        detail: item.detail,
        documentation: item.documentation,
        insertText: item.insertText,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range: range
      }));

      return { suggestions };
    }
  });
}

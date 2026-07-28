import React, { useRef, useEffect } from 'react';
import MonacoEditor, { Monaco, OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { registerTypstLanguage } from '../utils/typstSyntax';

interface Diagnostic {
  line: number;
  column: number;
  message: string;
  hint?: string;
}

interface EditorProps {
  code: string;
  onChange: (value: string) => void;
  diagnostics: Diagnostic[];
  onCursorChange: (line: number, column: number) => void;
  onSave: () => void;
  onCompile: () => void;
}

export const Editor: React.FC<EditorProps> = ({
  code,
  onChange,
  diagnostics,
  onCursorChange,
  onSave,
  onCompile
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  const handleEditorWillMount = (monaco: Monaco) => {
    registerTypstLanguage(monaco);
  };

  const handleEditorDidMount: OnMount = (editorInstance, monaco) => {
    editorRef.current = editorInstance;
    monacoRef.current = monaco;

    // Track cursor position
    editorInstance.onDidChangeCursorPosition((e) => {
      onCursorChange(e.position.lineNumber, e.position.column);
    });

    // Custom Keybindings
    editorInstance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSave();
    });

    editorInstance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onCompile();
    });
  };

  // Update error markers in Monaco Editor when diagnostics change
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;

    const model = editorRef.current.getModel();
    if (!model) return;

    const markers: editor.IMarkerData[] = diagnostics.map((diag) => {
      const line = Math.max(1, Math.min(diag.line, model.getLineCount()));
      const maxCol = model.getLineMaxColumn(line);
      const col = Math.max(1, Math.min(diag.column, maxCol));

      return {
        startLineNumber: line,
        startColumn: col,
        endLineNumber: line,
        endColumn: maxCol,
        message: diag.message,
        severity: monacoRef.current!.MarkerSeverity.Error
      };
    });

    monacoRef.current.editor.setModelMarkers(model, 'typst', markers);
  }, [diagnostics]);

  return (
    <div className="w-full h-full relative bg-[#0b0f19]">
      <MonacoEditor
        height="100%"
        language="typst"
        theme="typst-dark"
        value={code}
        onChange={(val) => onChange(val || '')}
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
        options={{
          fontSize: 14,
          fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
          fontLigatures: true,
          minimap: { enabled: true, scale: 0.75 },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          lineNumbers: 'on',
          renderLineHighlight: 'all',
          tabSize: 2,
          wordWrap: 'on',
          padding: { top: 12, bottom: 12 }
        }}
      />
    </div>
  );
};

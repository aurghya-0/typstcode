# ⚡ TypstCode - Modern Typst Desktop Editor

**TypstCode** is a modern, high-performance desktop editor for [Typst](https://typst.app/) built with **Electron**, **React**, **Vite**, and **Monaco Editor**.

![TypstCode](https://img.shields.io/badge/Electron-24.0+-47ABE4?style=flat-square&logo=electron&logoColor=white)
![Typst](https://img.shields.io/badge/Typst-v0.15.0-239120?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript&logoColor=white)

---

## ✨ Features

- **VS Code-Grade Monaco Editor**: Built-in syntax highlighting for Typst (`typst-dark` theme), line numbers, minimap, auto-closing brackets, and custom snippets.
- **Sub-Millisecond Live Preview**: Instant live rendering of Typst documents into high-resolution SVG pages directly within Electron.
- **File Explorer Sidebar**: Integrated file browser tree to easily navigate, open, and edit workspace files.
- **Interactive Error Diagnostics**: Real-time parsing of Typst compilation diagnostics; clicking any error jumps the editor cursor straight to the exact line & column.
- **Document Outline Navigation**: Automatically extracts headings (`= Section`, `== Subsection`) to navigate long documents effortlessly.
- **Snippet Palette & Cheat Sheet**: One-click insertion for equations, matrices, integrals, tables, callout boxes, and multi-column grid layouts.
- **Starter Template Gallery**: Pre-built templates for Modern Project Reports, IEEE Academic Research Papers, Executive Resumes, and Mathematics Cheat Sheets.
- **Multi-Format Export**: One-click PDF & PNG export powered by the local `typst` CLI binary.

---

## 🚀 Quick Start

### 1. Prerequisites
Ensure you have Node.js (v18+) and the `typst` binary installed on your system:
```bash
typst --version
```

### 2. Development Mode
Start Vite dev server and launch Electron simultaneously:
```bash
npm run dev
```

### 3. Packaging for Production
Build web assets and produce native desktop executables (`.AppImage`, `.deb`, `.dmg`, `.exe`):
```bash
npm run build
```

---

## 🛠️ Tech Stack

- **Desktop Container**: Electron
- **Bundler & Build Tool**: Vite + `vite-plugin-electron`
- **Frontend UI**: React 19 + TailwindCSS
- **Code Editor**: `@monaco-editor/react` (Monaco Editor engine)
- **Compiler**: Local `typst` binary (via Node `child_process.spawn`)
- **Icons**: `lucide-react`

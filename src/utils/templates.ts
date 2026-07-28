export interface TypstTemplate {
  id: string;
  name: string;
  category: 'Academic' | 'Reports' | 'Resume' | 'Presentation' | 'Cheatsheet';
  description: string;
  code: string;
}

export const TEMPLATES: TypstTemplate[] = [
  {
    id: 'modern-report',
    name: 'Modern Project Report',
    category: 'Reports',
    description: 'Clean college & university project report template with cover page, TOC, and dynamic running headers.',
    code: `// Modern Project Report Template
#set document(title: "Project Report", author: "Aurghyadip Kundu")
#set page(
  paper: "a4",
  margin: (top: 1.2in, bottom: 1.2in, left: 1.2in, right: 1.2in),
  header: context {
    let current-page = here().page()
    if current-page > 1 [
      #smallcaps("TypstCode Project Report") #h(1fr) #emph("Chapter 1")
      #v(-4pt)
      #line(length: 100%, stroke: 0.5pt + luma(120))
    ]
  },
  footer: context {
    let current-page = here().page()
    if current-page > 1 [
      #align(center)[#counter(page).display("1")]
    ]
  }
)

#set text(font: "Liberation Serif", size: 11pt, lang: "en")
#set par(justify: true, leading: 0.65em)

// Cover Page
#v(1fr)
#align(center)[
  #text(13pt, weight: "bold", smallcaps("Department of Computer Science & Engineering")) \\
  #v(1em)
  #text(28pt, weight: 900, fill: rgb("#1e3a8a"))[TYPSTCODE EDITOR] \\
  #v(0.5em)
  #text(14pt, weight: 300, style: "italic")[A Next-Generation Desktop Environment for Typst] \\
  #v(2em)
  #line(length: 40%, stroke: 1.5pt + rgb("#2563eb"))
  #v(2em)
  #text(12pt, weight: "bold")[Submitted By:] \\
  #v(0.5em)
  #grid(
    columns: (1fr, 1fr),
    gutter: 20pt,
    align(right)[
      *Aurghyadip Kundu* \\
      Roll: 123456789 \\
      Reg: 1000000010
    ],
    align(left)[
      *Under Guidance of:* \\
      Dr. Jane Smith \\
      Associate Professor
    ]
  )
]
#v(2fr)

#pagebreak()

// Abstract & Table of Contents
#outline(indent: auto)

#pagebreak()

// Main Content
= Introduction

TypstCode is a high-performance, modern IDE engineered specifically for compiling and authoring *Typst* documents with sub-millisecond live previews.

== Background & Motivation

Typst offers a fast, programmable markup language designed as a modern alternative to LaTeX.
Unlike traditional LaTeX toolchains, Typst compiles in milliseconds and provides native syntax for grid layouts, math typesetting, and custom scripting.

$ E = m c^2 + sum_(i=1)^n x_i $

== Key Architectural Features

- *Instant Live Preview*: SVG pages rendered directly inside Electron.
- *Monaco Editor Engine*: VS Code-grade code editor experience.
- *Native Compiler*: Leverages the installed \`typst\` CLI binary for 100% compatibility.

= Implementation Details

#table(
  columns: (1fr, 2fr, 1fr),
  fill: (x, y) => if y == 0 { rgb("#e2e8f0") } else { none },
  [*Module*], [*Description*], [*Tech Stack*],
  [Frontend], [React UI + Monaco Code Editor], [TypeScript],
  [Backend], [Electron IPC + Node Process Management], [Node.js],
  [Compiler], [Typst Native Binary], [Rust],
)

== Experimental Results

Here is a quick demonstration of inline code and math typesetting:

#align(center)[
  #rect(
    stroke: 1pt + rgb("#3b82f6"),
    inset: 12pt,
    radius: 6pt,
    fill: rgb("#eff6ff")
  )[
    #text(11pt, weight: "bold", fill: rgb("#1d4ed8"))[Definition 1.1 (Sub-millisecond Compilation)] \\
    A compilation pipeline is considered sub-millisecond if the end-to-end delta $Delta t < 10 "ms"$.
  ]
]

= Conclusion

Typstwriter streamlines academic writing, project reports, and technical documentation with speed and elegance.
`
  },
  {
    id: 'ieee-paper',
    name: 'Academic Conference Paper',
    category: 'Academic',
    description: 'Two-column IEEE style paper layout with abstract, sections, equations, and references.',
    code: `// Academic Conference Paper Template
#set page(
  paper: "us-letter",
  margin: (x: 0.6in, y: 0.75in)
)
#set text(font: "Liberation Serif", size: 10pt)
#set par(justify: true)

#align(center)[
  #text(18pt, weight: "bold")[A Lightweight Electron-Based Typst Editor Architecture]
  #v(1em)
  #text(11pt)[
    *Aurghyadip Kundu*\
    Department of Computer Science & Engineering\
    Calcutta Institute of Engineering and Management\
    \`aurghya@example.com\`
  ]
]

#v(1em)

#block(
  fill: rgb("#f8fafc"),
  inset: 10pt,
  radius: 4pt,
  stroke: 0.5pt + rgb("#cbd5e1")
)[
  #text(9pt, weight: "bold")[Abstract—]
  This paper introduces Typstwriter, a cross-platform desktop application designed to provide sub-second live preview and modern editing tools for Typst. By bridging Node.js IPC with native Rust-compiled Typst binaries, Typstwriter achieves instantaneous SVG rendering and precise error diagnostic highlighting.
]

#set columns(2)

= Introduction
Typesetting academic papers has traditionally been dominated by LaTeX. While powerful, LaTeX suffers from slow build times, complex package dependencies, and steep learning curves.

Typst resolves these drawbacks by offering a Rust-powered layout engine. This work presents an optimized Electron container for local Typst compilation.

= Mathematical Formulation

Consider a document rendering pipeline where the input stream $S$ is compiled into $N$ SVG pages $P_1, P_2, ..., P_N$:

$ P_k = bold(C)(S, lambda_k), quad k in \{1, 2, ..., N\} $

where $bold(C)$ represents the Typst compilation function and $lambda_k$ represents page-level parameters.

== Performance Evaluation

#table(
  columns: (1fr, 1fr, 1fr),
  [*Engine*], [*Cold Start*], [*Live Render*],
  [LaTeX (pdflatex)], [2.4 s], [1.8 s],
  [Typst CLI], [0.08 s], [0.02 s],
  [Typstwriter], [0.10 s], [0.015 s]
)

= Conclusion
The proposed architecture provides seamless writing and instantaneous visual feedback for scientific publication.
`
  },
  {
    id: 'executive-cv',
    name: 'Executive Resume / CV',
    category: 'Resume',
    description: 'Single-page modern resume with clean sidebar accents, contact info, experience, and skills grid.',
    code: `// Executive Resume / CV Template
#set page(
  paper: "a4",
  margin: (x: 1.5cm, y: 1.5cm)
)
#set text(font: "Liberation Sans", size: 10pt, fill: rgb("#1e293b"))
#set par(leading: 0.6em)

// Header
#grid(
  columns: (1fr, auto),
  align: (left, right),
  [
    #text(24pt, weight: 800, fill: rgb("#0f172a"))[AURGHYADIP KUNDU] \
    #text(12pt, weight: 600, fill: rgb("#2563eb"))[Senior Software Engineer & Systems Architect]
  ],
  [
    \`aurghya@example.com\` \
    +91 98765 43210 \
    github.com/aurghya-0 \
    Kolkata, India
  ]
)

#v(0.5em)
#line(length: 100%, stroke: 1.5pt + rgb("#3b82f6"))
#v(0.5em)

// Executive Summary
#text(11pt, weight: "bold", fill: rgb("#1e40af"))[EXECUTIVE SUMMARY]
#v(0.2em)
Passionate Software Engineer with expertise in desktop application development, Rust, TypeScript, and high-performance developer tooling. Proven track record in building modern Electron and native applications.

#v(0.8em)

// Experience Section
#text(11pt, weight: "bold", fill: rgb("#1e40af"))[PROFESSIONAL EXPERIENCE]
#v(0.4em)

#grid(
  columns: (1fr, auto),
  [*Lead Systems Architect* — Tech Innovators Inc.], [2023 – Present],
)
- Architected desktop compilation pipeline reducing build times by 85%.
- Led a team of 6 engineers developing cross-platform Electron applications.

#v(0.5em)

#grid(
  columns: (1fr, auto),
  [*Software Developer* — DevStudio Solutions], [2021 – 2023],
)
- Built interactive SVG rendering engines for technical documentation.
- Integrated LSP language services into WebAssembly and desktop targets.

#v(0.8em)

// Skills & Education
#grid(
  columns: (1fr, 1fr),
  gutter: 20pt,
  [
    #text(11pt, weight: "bold", fill: rgb("#1e40af"))[TECHNICAL SKILLS]
    #v(0.3em)
    - *Languages*: TypeScript, Rust, C++, Python
    - *Frameworks*: Electron, React, Vite, Node.js
    - *Document Tools*: Typst, LaTeX, Monaco Editor
  ],
  [
    #text(11pt, weight: "bold", fill: rgb("#1e40af"))[EDUCATION]
    #v(0.3em)
    *B.Tech in Information Technology* \
    Calcutta Institute of Engineering and Management \
    _CGPA: 8.9 / 10 (2021 - 2025)_
  ]
)
`
  },
  {
    id: 'math-cheatsheet',
    name: 'Mathematics Cheat Sheet',
    category: 'Cheatsheet',
    description: 'Compact 3-column reference sheet with matrix algebra, calculus formulas, and statistical distributions.',
    code: `// Mathematics Reference Cheat Sheet
#set page(
  paper: "a4",
  flipped: true,
  margin: (x: 1cm, y: 1cm)
)
#set text(font: "Liberation Serif", size: 8.5pt)
#set columns(3)

#align(center)[
  #block(fill: rgb("#1e293b"), inset: 6pt, radius: 4pt, width: 100%)[
    #text(12pt, weight: "bold", fill: white)[MATH & CALCULUS CHEATSHEET]
  ]
]

== Derivatives & Integrals

$ d/dx (x^n) = n x^(n-1) $
$ d/dx (e^x) = e^x, quad d/dx (ln x) = 1/x $
$ int x^n dx = x^(n+1)/(n+1) + C $
$ int e^x dx = e^x + C $

== Linear Algebra

Matrix Multiplication $C = A B$:
$ C_(i j) = sum_(k=1)^n A_(i k) B_(k j) $

Determinant of $2 times 2$ matrix:
$ det mat(a, b; c, d) = a d - b c $

Eigenvalue equation:
$ A bold(v) = lambda bold(v) $

== Probability & Statistics

Normal Distribution PDF:
$ f(x) = 1/(sigma sqrt(2 pi)) e^(- (x - mu)^2 / (2 sigma^2)) $

Expected Value:
$ E[X] = int_(-infty)^(infty) x f(x) dx $

== Taylor Series

$ f(x) = sum_(n=0)^(infty) (f^((n))(a))/(n!) (x - a)^n $
`
  }
];

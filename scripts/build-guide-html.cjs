#!/usr/bin/env node
// Build a styled HTML from the integration guide MD, then let chromium print it to PDF.
const fs = require('fs')
const path = require('path')
const { marked } = require('marked')

const md = fs.readFileSync(path.join(__dirname, '..', 'docs', 'INTEGRATION_GUIDE.md'), 'utf8')
const body = marked.parse(md)

const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>AgencyOS AI — Integration Guide</title>
<style>
  @page { size: A4; margin: 20mm 16mm; }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, "Segoe UI", "Inter", Roboto, sans-serif;
    color: #111827;
    line-height: 1.55;
    font-size: 11pt;
    max-width: 900px;
    margin: 0 auto;
  }
  h1 {
    font-size: 26pt;
    margin: 0 0 6pt 0;
    background: linear-gradient(135deg, #7C3AED 0%, #3B82F6 50%, #A855F7 100%);
    -webkit-background-clip: text;
    color: transparent;
    letter-spacing: -0.5px;
  }
  h2 {
    font-size: 16pt;
    margin: 24pt 0 6pt 0;
    padding-bottom: 6pt;
    border-bottom: 2px solid #E5E7EB;
    color: #111;
    letter-spacing: -0.3px;
    page-break-after: avoid;
  }
  h3 { font-size: 12pt; margin: 14pt 0 4pt 0; color: #4C1D95; page-break-after: avoid; }
  h4 { font-size: 11pt; margin: 10pt 0 2pt 0; color: #6D28D9; }
  p  { margin: 6pt 0; }
  a  { color: #6D28D9; text-decoration: none; border-bottom: 1px dotted #C4B5FD; }
  ul, ol { margin: 6pt 0; padding-left: 22pt; }
  li { margin: 2pt 0; }
  code {
    font-family: "JetBrains Mono", "Fira Code", Menlo, monospace;
    font-size: 9.5pt;
    background: #F3F4F6;
    color: #7C3AED;
    padding: 1pt 4pt;
    border-radius: 3pt;
  }
  pre {
    background: #0F172A;
    color: #E2E8F0;
    padding: 12pt;
    border-radius: 6pt;
    overflow-x: auto;
    font-size: 9pt;
    line-height: 1.5;
    page-break-inside: avoid;
  }
  pre code { background: transparent; color: inherit; padding: 0; }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 9.5pt;
    margin: 8pt 0;
    page-break-inside: avoid;
  }
  th {
    background: linear-gradient(135deg, #7C3AED, #3B82F6);
    color: white;
    text-align: left;
    padding: 6pt 8pt;
    font-weight: 600;
  }
  td { border-bottom: 1px solid #E5E7EB; padding: 6pt 8pt; vertical-align: top; }
  tr:nth-child(even) td { background: #FAFAFA; }
  hr { border: 0; border-top: 1px solid #E5E7EB; margin: 20pt 0; }
  blockquote {
    border-left: 3px solid #7C3AED;
    background: #F5F3FF;
    padding: 6pt 12pt;
    margin: 8pt 0;
    color: #4C1D95;
  }
  strong { color: #111; font-weight: 700; }
  .cover {
    text-align: center;
    padding: 60pt 0 20pt 0;
    border-bottom: 3px solid #7C3AED;
    margin-bottom: 20pt;
  }
  .cover .badge {
    display: inline-block;
    padding: 4pt 10pt;
    background: linear-gradient(135deg, #7C3AED, #3B82F6);
    color: white;
    border-radius: 999pt;
    font-size: 9pt;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 12pt;
  }
  .cover p { color: #6B7280; margin-top: 4pt; }
</style>
</head>
<body>
<div class="cover">
  <div class="badge">Developer Handbook</div>
  <h1>AgencyOS AI — Integration Guide</h1>
  <p>From MOCK to REAL — every integration, mapped.</p>
</div>
${body}
</body>
</html>`

fs.writeFileSync('/tmp/guide.html', html)
console.log('Wrote /tmp/guide.html (' + html.length + ' bytes)')

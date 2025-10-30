#!/usr/bin/env node
// Simple generator: reads posts/*.md, extracts title/date/excerpt, writes posts/*.html and posts/index.json
const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, '..', 'posts');

function readFiles(dir) {
  return fs.readdirSync(dir).filter(f => f.endsWith('.md'));
}

function parseMarkdown(md) {
  // Very small parser for title (first H1) and Date: line, and first paragraph as excerpt.
  const lines = md.split(/\r?\n/);
  let title = null;
  let date = null;
  let excerpt = null;
  let inFrontmatter = false;
  let frontmatter = {};

  // Check YAML frontmatter
  if (lines[0].trim() === '---') {
    inFrontmatter = true;
    let i = 1;
    for (; i < lines.length; i++) {
      if (lines[i].trim() === '---') { inFrontmatter = false; break; }
      const m = lines[i].match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
      if (m) frontmatter[m[1].toLowerCase()] = m[2].trim();
    }
  }
  if (frontmatter.title) title = frontmatter.title;
  if (frontmatter.date) date = frontmatter.date;

  // Fallback scanning
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!title) {
      const mh = line.match(/^#\s+(.*)$/);
      if (mh) title = mh[1].trim();
    }
    if (!date) {
      const md = line.match(/^Date:\s*(.*)$/i);
      if (md) date = md[1].trim();
    }
    if (!excerpt && line.length > 0 && !line.startsWith('#') && !line.startsWith('Date:') && !line.startsWith('Topics:')) {
      excerpt = line;
    }
    if (title && date && excerpt) break;
  }
  return { title: title || 'Untitled', date: date || '', excerpt: excerpt || '' };
}

function mdToHtml(md) {
  // Minimal markdown-to-html: headers (#, ##), links [text](url), paragraphs
  let out = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // links
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  // headers
  out = out.replace(/^###\s+(.*)$/gm, '<h3>$1</h3>');
  out = out.replace(/^##\s+(.*)$/gm, '<h2>$1</h2>');
  out = out.replace(/^#\s+(.*)$/gm, '<h1>$1</h1>');
  // bold/italic simple
  out = out.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // paragraphs: split by blank lines
  const parts = out.split(/(?:\r?\n){2,}/).map(p => p.trim()).filter(Boolean);
  out = parts.map(p => {
    // if starts with header or list or block already, leave as is
    if (/^<h[123]>/.test(p) || /^<ul>|^<ol>|^<blockquote>/.test(p)) return p;
    // convert line breaks to <br>
    p = p.replace(/\r?\n/g, '<br>');
    return '<p>' + p + '</p>';
  }).join('\n');
  return out;
}

function slugFromFilename(filename) {
  // filename: theme-slug-YYYY-MM-DD.md -> theme-slug-YYYY-MM-DD
  return filename.replace(/\.md$/i, '');
}

function themeFromFilename(filename) {
  // attempt to extract a date in filename and take prefix as theme
  const m = filename.match(/^(.*)-(\d{4}-\d{2}-\d{2})\.md$/);
  if (m) return m[1];
  return filename.replace(/\.md$/i, '');
}

function generate() {
  const files = readFiles(POSTS_DIR);
  const index = [];
  files.forEach(file => {
    const full = path.join(POSTS_DIR, file);
    const md = fs.readFileSync(full, 'utf8');
    const meta = parseMarkdown(md);
    const slug = slugFromFilename(file);
    const theme = themeFromFilename(file);
    const htmlBody = mdToHtml(md);
    const html = `<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"utf-8\">\n  <title>${escapeHtml(meta.title)}</title>\n  <link rel=\"stylesheet\" href=\"../assets/css/base.css\">\n</head>\n<body>\n  <header>\n    <h1>${escapeHtml(meta.title)}</h1>\n    <nav>\n      <a href=\"../index.html\">Home</a> | <a href=\"../blogs.html\">Blogs</a>\n    </nav>\n  </header>\n  <main>\n${htmlBody}\n  </main>\n  <footer>\n    <p>© 2025 Himal Shrestha | “Rebooting the Soul”</p>\n  </footer>\n</body>\n</html>`;

    const outHtmlPath = path.join(POSTS_DIR, slug + '.html');
    fs.writeFileSync(outHtmlPath, html, 'utf8');

    index.push({
      title: meta.title,
      date: meta.date,
      theme: theme,
      path: 'posts/' + slug + '.html',
      excerpt: meta.excerpt
    });
    console.log('Generated', outHtmlPath);
  });
  // sort index by date desc
  index.sort((a,b) => (b.date || '').localeCompare(a.date || ''));
  const outIndex = path.join(POSTS_DIR, 'index.json');
  fs.writeFileSync(outIndex, JSON.stringify(index, null, 2), 'utf8');
  console.log('Wrote', outIndex);
}

function escapeHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

generate();

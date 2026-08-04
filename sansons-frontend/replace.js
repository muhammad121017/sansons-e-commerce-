const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');

files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace glass-card
  content = content.replace(/glass-card-hover/g, 'hover:shadow-hover hover:border-primary/20');
  content = content.replace(/glass-card/g, 'bg-surface border border-border shadow-elevated');
  
  // Replace glass-surface
  content = content.replace(/glass-surface/g, 'bg-background border-y border-border');

  // Replace bg-slate-900/50 etc
  content = content.replace(/bg-slate-900\/50/g, 'bg-surface');
  content = content.replace(/bg-slate-900\/80/g, 'bg-surface/80');
  content = content.replace(/bg-slate-900/g, 'bg-surface');
  
  // Also clean up generic borders if they were alongside glass-card
  content = content.replace(/border-white\/5/g, 'border-border');
  content = content.replace(/border-white\/10/g, 'border-border');

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});

console.log('Replacement complete.');

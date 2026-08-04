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
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
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

  // Replace imports
  content = content.replace(/@\/components\/Navbar/g, '@/components/layout/Navbar');
  content = content.replace(/@\/components\/Footer/g, '@/components/layout/Footer');

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log(`Updated import in ${file}`);
  }
});

console.log('Import replacement complete.');

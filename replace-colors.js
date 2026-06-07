const fs = require('fs');
const path = require('path');

const dirsToSearch = ['app', 'components', 'lib'];

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replacements
  content = content.replace(/LuxeEstate/g, 'Inmobae-Lucky');
  
  // Color renaming in tailwind classes
  // mosque -> argentina-blue
  // nordic -> argentina-navy
  // hint-of-green -> argentina-sun
  // clear-day -> argentina-light
  
  content = content.replace(/mosque/g, 'argentina-blue');
  content = content.replace(/nordic/g, 'argentina-navy');
  content = content.replace(/hint-of-green/g, 'argentina-sun');
  content = content.replace(/clear-day/g, 'argentina-light');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function traverseDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseDir(fullPath);
    } else if (fullPath.match(/\.(tsx|ts|css|js|jsx)$/)) {
      replaceInFile(fullPath);
    }
  }
}

dirsToSearch.forEach(dir => {
  const fullDirPath = path.join(__dirname, dir);
  if (fs.existsSync(fullDirPath)) {
    traverseDir(fullDirPath);
  }
});

console.log('Search and replace completed.');

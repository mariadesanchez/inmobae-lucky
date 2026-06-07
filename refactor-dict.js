const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath, callback);
    } else {
      if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
        callback(fullPath);
      }
    }
  });
}

function processFiles(directories) {
  directories.forEach(dir => {
    walk(dir, filePath => {
      let content = fs.readFileSync(filePath, 'utf8');
      let original = content;

      content = content.replace(/getDictionary\(locale\)/g, 'getDictionary()');

      if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${filePath}`);
      }
    });
  });
}

processFiles(['./app', './components', './lib']);

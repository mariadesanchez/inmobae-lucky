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

      content = content.replace(/mapDbRowToProperty\(propDbRow,\s*locale\)/g, 'mapDbRowToProperty(propDbRow)');
      content = content.replace(/mapDbRowToProperty\(rawRow,\s*locale\)/g, 'mapDbRowToProperty(rawRow)');
      content = content.replace(/mapDbRowToProperty\(row,\s*locale\)/g, 'mapDbRowToProperty(row)');
      content = content.replace(/mapDbRowToProperty\(p,\s*locale\)/g, 'mapDbRowToProperty(p)');
      content = content.replace(/locale:\s*string\s*=\s*'en'/g, '');
      content = content.replace(/export const mapDbRowToProperty = \(row: any,\s*\):\s*Property/g, 'export const mapDbRowToProperty = (row: any): Property');

      if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${filePath}`);
      }
    });
  });
}

processFiles(['./app', './components', './lib']);

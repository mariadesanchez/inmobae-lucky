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

const replaceRules = [
  // Remove /${locale} from strings
  { regex: /\/\$\{locale\}/g, replace: '' },
  // Remove /${resolvedParams.locale}
  { regex: /\/\$\{resolvedParams\.locale\}/g, replace: '' },
  // Replace params.locale type
  { regex: /locale:\s*string[;,]?/g, replace: '' },
  // Replace locale string destructured
  { regex: /const\s+\{\s*locale[a-zA-Z\s,]*\}\s*=\s*await\s+params;/g, replace: '' },
  { regex: /const\s+locale\s*=\s*resolvedParams\.locale;/g, replace: '' },
];

function processFiles(directories) {
  directories.forEach(dir => {
    walk(dir, filePath => {
      let content = fs.readFileSync(filePath, 'utf8');
      let original = content;

      replaceRules.forEach(rule => {
        content = content.replace(rule.regex, rule.replace);
      });

      if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${filePath}`);
      }
    });
  });
}

processFiles(['./app', './components']);

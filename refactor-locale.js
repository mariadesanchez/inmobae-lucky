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
  // Remove Locale imports
  { regex: /import\s+\{\s*Locale\s*\}\s*from\s*'@\/i18n-config';\n?/g, replace: '' },
  { regex: /import\s+type\s+\{\s*Locale\s*\}\s*from\s*'@\/i18n-config';\n?/g, replace: '' },
  // Remove as Locale casts
  { regex: /\s+as\s+Locale/g, replace: '' },
  // Remove Locale type definitions in interfaces
  { regex: /locale\?:\s*Locale;/g, replace: '' },
  { regex: /locale:\s*Locale;/g, replace: '' },
  // Remove locale={locale}
  { regex: /\s*locale=\{locale\}/g, replace: '' },
  // Remove locale="es"
  { regex: /\s*locale="[^"]*"/g, replace: '' },
  // Remove locale?: string; in interfaces
  { regex: /locale\?:\s*string;/g, replace: '' },
  // Remove locale: string; in interfaces
  { regex: /locale:\s*string;/g, replace: '' },
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

processFiles(['./app', './components', './lib']);

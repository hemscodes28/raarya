const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/blogs_data.json');
let raw = fs.readFileSync(filePath, 'utf8');

// Strip BOM if present
raw = raw.replace(/^\uFEFF/, '');

// The problem: &ldquo; and &rdquo; were replaced with " (regular double quote)
// which breaks JSON. We need to replace those with typographic quotes or escaped quotes.
// Since we know which lines are broken (text fields with unescaped "), 
// let's use a regex to fix text field values.

// Strategy: find all "text": "..." lines and properly escape inner double quotes
const lines = raw.split('\n');
const fixed = lines.map(line => {
  const trimmed = line.trim();
  if (!trimmed.startsWith('"text":')) return line;

  // Find the indent
  const indent = line.match(/^(\s*)/)[1];
  
  // Extract everything after "text": "
  const afterKey = line.indexOf('"text":');
  if (afterKey === -1) return line;
  
  const valueStart = line.indexOf('"', afterKey + 8); // skip "text": 
  if (valueStart === -1) return line;
  
  // Find the last " on the line (closing quote)
  const valueEnd = line.lastIndexOf('"');
  if (valueEnd <= valueStart) return line;
  
  // Extract inner content
  const inner = line.substring(valueStart + 1, valueEnd);
  
  // If inner contains unescaped double quotes, replace with typographic quotes
  // We'll use \u201C and \u201D (curly quotes) to avoid JSON breakage
  const fixedInner = inner.replace(/"/g, '\u201C').replace(/\u201C([^,\s])/g, '\u201C$1');
  
  // Actually, simpler: escape all unescaped double quotes in the inner text
  // Re-escape properly: the inner should have \" not "
  const escaped = inner.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  
  return `${indent}"text": "${escaped}"`;
});

const result = fixed.join('\n');

// Validate
try {
  JSON.parse(result);
  console.log('JSON is valid!');
  fs.writeFileSync(filePath, result, { encoding: 'utf8' });
  console.log('File saved successfully.');
} catch (e) {
  console.error('Still invalid JSON:', e.message);
  // Find approximate problem location
  const pos = parseInt(e.message.match(/position (\d+)/)?.[1] || '0');
  console.log('Near:', result.substring(Math.max(0, pos - 50), pos + 50));
}

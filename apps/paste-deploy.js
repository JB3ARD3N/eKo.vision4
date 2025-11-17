#!/usr/bin/env node
/**
 * PASTE & DEPLOY - One-click deployment interface
 *
 * Usage:
 *   node paste-deploy.js [file-to-update]
 *
 * Examples:
 *   node paste-deploy.js landing/app/page.tsx
 *   node paste-deploy.js landing/app/new-page/page.tsx
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🚀 PASTE & DEPLOY - One-Click Development\n');
console.log('═══════════════════════════════════════════\n');

// Get target file from args or prompt
const targetFile = process.argv[2];

if (!targetFile) {
  console.log('Usage: node paste-deploy.js <file-path>');
  console.log('\nExamples:');
  console.log('  node paste-deploy.js landing/app/page.tsx');
  console.log('  node paste-deploy.js landing/app/about/page.tsx');
  process.exit(1);
}

const fullPath = path.join(__dirname, targetFile);
const dir = path.dirname(fullPath);

// Create directory if it doesn't exist
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
  console.log(`✅ Created directory: ${dir}\n`);
}

console.log(`📝 Target file: ${targetFile}`);
console.log('\n📋 Paste your code below (Ctrl+D when done):\n');
console.log('───────────────────────────────────────────\n');

let code = '';

rl.on('line', (line) => {
  code += line + '\n';
});

rl.on('close', () => {
  if (!code.trim()) {
    console.log('\n❌ No code provided. Exiting.');
    process.exit(1);
  }

  // Write the file
  fs.writeFileSync(fullPath, code);

  console.log('\n───────────────────────────────────────────\n');
  console.log(`✅ Code written to: ${fullPath}`);
  console.log(`📦 File size: ${code.length} bytes`);

  console.log('\n🎯 Next steps:\n');
  console.log('  1. Run: cd apps/landing && pnpm dev');
  console.log('  2. Open: http://localhost:3000');
  console.log('  3. Deploy: pnpm deploy (or see QUICK-DEPLOY.md)');
  console.log('\n🔥 Your code is ready!\n');
});

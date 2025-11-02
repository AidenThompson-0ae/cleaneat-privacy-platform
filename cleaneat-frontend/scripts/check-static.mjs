#!/usr/bin/env node
/**
 * Check for violations of static export constraints
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const FORBIDDEN_PATTERNS = [
  { pattern: /getServerSideProps/g, message: 'getServerSideProps (SSR)' },
  { pattern: /getInitialProps/g, message: 'getInitialProps (SSR)' },
  { pattern: /from\s+['"]next\/headers['"]/g, message: 'next/headers (server-only)' },
  { pattern: /import\s+.*cookies.*from\s+['"]next\/headers['"]/g, message: 'cookies() from next/headers' },
  { pattern: /import\s+.*headers.*from\s+['"]next\/headers['"]/g, message: 'headers() from next/headers' },
  { pattern: /from\s+['"]server-only['"]/g, message: 'server-only package' },
  { pattern: /export\s+const\s+dynamic\s*=\s*['"]force-dynamic['"]/g, message: "dynamic='force-dynamic'" },
];

const FORBIDDEN_DIRS = [
  'pages/api',
  'app/api',
];

let errorCount = 0;

/**
 * Recursively find all TypeScript/JavaScript files
 */
function findSourceFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;

  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules' && file !== 'out') {
        findSourceFiles(filePath, fileList);
      }
    } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Check for forbidden patterns in file content
 */
function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(ROOT, filePath);

  FORBIDDEN_PATTERNS.forEach(({ pattern, message }) => {
    if (pattern.test(content)) {
      console.error(`❌ Found ${message} in: ${relativePath}`);
      errorCount++;
    }
  });

  // Check for dynamic routes without generateStaticParams
  if (/\[.*\]/.test(filePath) && /\/page\.(tsx?|jsx?)$/.test(filePath)) {
    if (!content.includes('generateStaticParams')) {
      console.error(`❌ Dynamic route without generateStaticParams: ${relativePath}`);
      errorCount++;
    }
  }
}

/**
 * Check for forbidden directories
 */
function checkForbiddenDirs() {
  FORBIDDEN_DIRS.forEach((dir) => {
    const fullPath = path.join(ROOT, dir);
    if (fs.existsSync(fullPath)) {
      console.error(`❌ Forbidden directory exists: ${dir}`);
      errorCount++;
    }
  });
}

/**
 * Main check function
 */
function main() {
  console.log('🔍 Checking static export constraints...\n');

  // Check forbidden directories
  checkForbiddenDirs();

  // Find and check all source files
  const sourceFiles = findSourceFiles(path.join(ROOT, 'app'))
    .concat(findSourceFiles(path.join(ROOT, 'components')))
    .concat(findSourceFiles(path.join(ROOT, 'hooks')))
    .concat(findSourceFiles(path.join(ROOT, 'fhevm')));

  sourceFiles.forEach(checkFile);

  // Check next.config.ts
  const nextConfigPath = path.join(ROOT, 'next.config.ts');
  if (fs.existsSync(nextConfigPath)) {
    const content = fs.readFileSync(nextConfigPath, 'utf-8');
    if (!content.includes("output: 'export'")) {
      console.error(`❌ next.config.ts missing: output: 'export'`);
      errorCount++;
    }
    if (!content.includes('unoptimized: true')) {
      console.error(`❌ next.config.ts missing: images.unoptimized: true`);
      errorCount++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  if (errorCount === 0) {
    console.log('✅ All static export checks passed!');
    process.exit(0);
  } else {
    console.error(`❌ Found ${errorCount} violation(s) of static export constraints`);
    console.log('\n📝 Fix the issues above and run again.');
    process.exit(1);
  }
}

main();


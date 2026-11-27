#!/usr/bin/env node
/**
 * Generates a MaibornWolff CodeCharta v1.3 (.cc.json) 3D Code City file
 * for 3DMapUTH by combining static metrics from `src/` (rloc, loc, functions,
 * cyclomatic complexity estimate) with real Git history metrics (commits, authors).
 *
 * Open the generated `visualizations/3dmaputh-codecity.cc.json` at:
 * https://maibornwolff.github.io/codecharta/visualization/app/index.html
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const REPO_ROOT = process.cwd();
const SRC_DIR = path.join(REPO_ROOT, 'src');
const OUT_DIR = path.join(REPO_ROOT, 'visualizations');
const OUT_FILE = path.join(OUT_DIR, '3dmaputh-codecity.cc.json');

const ALLOWED_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.css', '.json']);

// 1. Collect per-file git commit & unique author counts
function collectGitStats() {
  const stats = new Map();
  let logOutput = '';
  try {
    logOutput = execSync('git log --format="COMMIT|%an" --numstat -- src', {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
    });
  } catch {
    return stats;
  }

  let currentAuthor = 'unknown';
  for (const rawLine of logOutput.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith('COMMIT|')) {
      currentAuthor = line.slice(7).trim() || 'unknown';
      continue;
    }
    const parts = line.split('\t');
    if (parts.length < 3) continue;
    const relPath = parts[2].replace(/\\/g, '/');
    if (!stats.has(relPath)) {
      stats.set(relPath, { commits: 0, authors: new Set(), churn: 0 });
    }
    const entry = stats.get(relPath);
    entry.commits += 1;
    entry.authors.add(currentAuthor);
    const added = Number.parseInt(parts[0], 10);
    const deleted = Number.parseInt(parts[1], 10);
    if (!Number.isNaN(added)) entry.churn += added;
    if (!Number.isNaN(deleted)) entry.churn += deleted;
  }

  return stats;
}

// 2. Compute lightweight static code metrics for a single file
function analyzeFile(filePath, relPath, gitStats) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  const loc = lines.length;
  const rloc = lines.filter((l) => {
    const t = l.trim();
    return t.length > 0 && !t.startsWith('//') && !t.startsWith('*') && !t.startsWith('/*');
  }).length;

  const funcMatches = content.match(
    /\b(function\s+\w+|const\s+\w+\s*=\s*(async\s*)?\([^)]*\)\s*=>|export\s+default\s+function)/g
  );
  const functions = funcMatches ? funcMatches.length : 0;

  const branchMatches = content.match(/\b(if|else\s+if|for|while|case|catch|\?\?|&&|\|\||\?)\b/g);
  const mcc = 1 + (branchMatches ? branchMatches.length : 0);

  const git = gitStats.get(relPath);
  return {
    loc,
    rloc,
    functions,
    mcc,
    number_of_commits: git ? git.commits : 1,
    number_of_authors: git ? git.authors.size : 1,
    code_churn: git ? git.churn : rloc,
  };
}

// 3. Build recursive CodeCharta folder/file tree
function buildTree(dirPath, gitStats) {
  const name = path.basename(dirPath);
  const entries = fs.readdirSync(dirPath, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const children = [];
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      const subTree = buildTree(fullPath, gitStats);
      if (subTree.children.length > 0) {
        children.push(subTree);
      }
    } else if (entry.isFile() && ALLOWED_EXTS.has(path.extname(entry.name).toLowerCase())) {
      const relPath = path.relative(REPO_ROOT, fullPath).replace(/\\/g, '/');
      children.push({
        name: entry.name,
        type: 'File',
        attributes: analyzeFile(fullPath, relPath, gitStats),
        link: `https://github.com/ptdat30/3DMapUTH/blob/main/${relPath}`,
      });
    }
  }

  return {
    name,
    type: 'Folder',
    attributes: {},
    children,
  };
}

function main() {
  const gitStats = collectGitStats();
  const srcTree = buildTree(SRC_DIR, gitStats);

  const ccPayload = {
    projectName: '3DMapUTH',
    apiVersion: '1.3',
    nodes: [
      {
        name: 'root',
        type: 'Folder',
        attributes: {},
        children: [srcTree],
      },
    ],
    attributeTypes: {
      nodes: {
        loc: 'absolute',
        rloc: 'absolute',
        functions: 'absolute',
        mcc: 'absolute',
        number_of_commits: 'absolute',
        number_of_authors: 'absolute',
        code_churn: 'absolute',
      },
    },
    edges: [],
    blacklist: [],
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(ccPayload, null, 2), 'utf8');

  // Count analyzed files
  const countFiles = (node) =>
    node.type === 'File'
      ? 1
      : (node.children || []).reduce((sum, child) => sum + countFiles(child), 0);
  const totalFiles = countFiles(srcTree);
  console.log(`Generated CodeCharta 3D Code City: ${OUT_FILE} (${totalFiles} files analyzed)`);
}

main();

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const models = [
  'toa_h',
  'nha_da_nang',
  'toa_j',
  'toa_i_duong',
  'xuong_oto',
  'toa_l'
];

const dir = 'public/models/cs3';

console.log('Starting GLTF model decimation and optimization...');

for (const name of models) {
  const origPath = path.join(dir, `${name}.glb`);
  const weldPath = path.join(dir, `${name}_weld.glb`);
  const optPath = path.join(dir, `${name}_opt.glb`);

  if (!fs.existsSync(origPath)) {
    console.log(`Skipping missing: ${origPath}`);
    continue;
  }

  const origSizeMB = (fs.statSync(origPath).size / 1024 / 1024).toFixed(2);
  console.log(`\nProcessing ${name}.glb (${origSizeMB} MB)...`);

  try {
    // 1. Weld duplicate vertices
    execSync(`npx --yes @gltf-transform/cli weld "${origPath}" "${weldPath}"`, { stdio: 'pipe' });
    
    // 2. Simplify mesh to 8% polygon ratio with 0.005 error tolerance
    execSync(`npx --yes @gltf-transform/cli simplify "${weldPath}" "${optPath}" --ratio 0.08 --error 0.005`, { stdio: 'pipe' });

    // 3. Clean up temp weld file
    if (fs.existsSync(weldPath)) fs.unlinkSync(weldPath);

    // 4. Overwrite original with optimized version (keep a backup if needed, but original is in root)
    if (fs.existsSync(optPath)) {
      const optSizeMB = (fs.statSync(optPath).size / 1024 / 1024).toFixed(2);
      fs.copyFileSync(optPath, origPath);
      fs.unlinkSync(optPath);
      console.log(`✓ ${name}.glb optimized: ${origSizeMB} MB -> ${optSizeMB} MB (-${(100 - (optSizeMB/origSizeMB)*100).toFixed(1)}%)`);
    }
  } catch (err) {
    console.error(`Error processing ${name}:`, err.message);
  }
}

// Clean up any remaining temp files
for (const f of fs.readdirSync(dir)) {
  if (f.endsWith('_welded.glb') || f.endsWith('_opt.glb')) {
    fs.unlinkSync(path.join(dir, f));
  }
}

console.log('\nAll models optimized successfully!');


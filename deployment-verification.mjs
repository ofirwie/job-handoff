import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

console.log('🚀 VERCEL DEPLOYMENT READINESS CHECK');
console.log('=====================================\n');

const results = [];

// 1. Build artifacts check
console.log('1️⃣ BUILD ARTIFACTS');
const buildExists = fs.existsSync('./dist/index.html');
const assetsExist = fs.existsSync('./dist/assets');
console.log(`   Build files: ${buildExists ? '✅' : '❌'}`);
console.log(`   Assets folder: ${assetsExist ? '✅' : '❌'}`);
results.push(buildExists && assetsExist);

// 2. Vercel configuration
console.log('\n2️⃣ VERCEL CONFIG');
const vercelConfig = JSON.parse(fs.readFileSync('./vercel.json', 'utf8'));
const hasCorrectBuild = vercelConfig.buildCommand === 'npm run build';
const hasCorrectOutput = vercelConfig.outputDirectory === 'dist';
const hasEnvVars = vercelConfig.env && vercelConfig.env.VITE_SUPABASE_URL && vercelConfig.env.VITE_SUPABASE_ANON_KEY;
console.log(`   Build command: ${hasCorrectBuild ? '✅' : '❌'}`);
console.log(`   Output directory: ${hasCorrectOutput ? '✅' : '❌'}`);
console.log(`   Environment variables: ${hasEnvVars ? '✅' : '❌'}`);
results.push(hasCorrectBuild && hasCorrectOutput && hasEnvVars);

// 3. Database connectivity
console.log('\n3️⃣ DATABASE CONNECTION');
const supabase = createClient(
  vercelConfig.env.VITE_SUPABASE_URL,
  vercelConfig.env.VITE_SUPABASE_ANON_KEY
);

try {
  const { data: orgData, error: orgError } = await supabase.from('organizations').select('count');
  const { data: handoverData, error: handoverError } = await supabase.from('handovers').select('count');
  
  console.log(`   Organizations table: ${!orgError ? '✅' : '❌'}`);
  console.log(`   Handovers table: ${!handoverError ? '✅' : '❌'}`);
  results.push(!orgError && !handoverError);
} catch (e) {
  console.log(`   Database connection: ❌ ${e.message}`);
  results.push(false);
}

// 4. Package.json check
console.log('\n4️⃣ PACKAGE CONFIGURATION');
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const hasCorrectScript = pkg.scripts.build === 'npx vite build';
const hasDependencies = pkg.dependencies['@supabase/supabase-js'] && pkg.dependencies['react'];
console.log(`   Build script: ${hasCorrectScript ? '✅' : '❌'}`);
console.log(`   Required dependencies: ${hasDependencies ? '✅' : '❌'}`);
results.push(hasCorrectScript && hasDependencies);

// 5. Git status
console.log('\n5️⃣ GIT REPOSITORY');
try {
  const { execSync } = await import('child_process');
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
  const isClean = gitStatus.trim() === '';
  console.log(`   Repository clean: ${isClean ? '✅' : '⚠️  Has uncommitted changes'}`);
  results.push(true); // Git status doesn't block deployment
} catch (e) {
  console.log(`   Git check: ⚠️  ${e.message}`);
  results.push(true);
}

// Final verdict
console.log('\n' + '='.repeat(40));
const allPassed = results.every(r => r);
const passCount = results.filter(r => r).length;

console.log(`📊 CHECKS PASSED: ${passCount}/${results.length}`);

if (allPassed) {
  console.log('🎉 DEPLOYMENT READY!');
  console.log('✅ All critical checks passed');
  console.log('🚀 Safe to deploy to Vercel');
  console.log('\nNext steps:');
  console.log('1. Push changes to main branch');
  console.log('2. Deploy to Vercel');
  console.log('3. Verify deployment URL works');
} else {
  console.log('⚠️  ISSUES DETECTED');
  console.log('❌ Fix issues before deploying');
}

console.log('\n' + '='.repeat(40));
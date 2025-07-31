const { execSync } = require('child_process');
const path = require('path');

const timestamp = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
const backupFileName = `job-handoff-project-backup-${timestamp}.bundle`;
const backupPath = path.join('..', backupFileName);

console.log('Creating backup...');
console.log(`Backup file: ${backupFileName}`);

try {
  // Create git bundle with all branches and tags
  execSync(`git bundle create ${backupPath} --all`, {
    cwd: __dirname,
    stdio: 'inherit'
  });
  
  console.log('✅ Backup created successfully!');
  console.log(`Location: ${path.resolve(__dirname, backupPath)}`);
} catch (error) {
  console.error('❌ Error creating backup:', error.message);
  process.exit(1);
}
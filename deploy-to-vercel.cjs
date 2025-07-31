#!/usr/bin/env node

// Simple deployment script for Vercel
const fs = require('fs');
const path = require('path');

console.log('🚀 Job Handoff System - Vercel Deployment');
console.log('==========================================');

// Check if build exists
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  console.error('❌ Build files not found. Run "npm run build" first.');
  process.exit(1);
}

console.log('✅ Build files found');

// Display deployment options
console.log('\n📋 Deployment Options:');
console.log('');
console.log('1. 🌐 Web Dashboard (Recommended):');
console.log('   - Go to: https://vercel.com/new');
console.log('   - Import GitHub repo: ofirwie/job-handoff');
console.log('   - Framework: Vite');
console.log('   - Build: npm run build');
console.log('   - Output: dist');
console.log('   - Deploy!');
console.log('');
console.log('2. 📁 Direct Upload:');
console.log('   - Go to: https://vercel.com/new');
console.log('   - Drag & drop the "dist" folder');
console.log('');
console.log('3. 🔗 CLI (if logged in):');
console.log('   - npx vercel --prod');
console.log('');

// Show environment variables that will be needed
console.log('📝 Environment Variables (set after deployment):');
console.log('');
console.log('Optional (configure via Settings UI):');
console.log('- GOOGLE_SERVICE_ACCOUNT_KEY');
console.log('- GOOGLE_SHEETS_ID');
console.log('- GOOGLE_DRIVE_PARENT_FOLDER_ID');
console.log('- CRON_SECRET');
console.log('- SUPABASE_SERVICE_ROLE_KEY');
console.log('');
console.log('✨ Supabase is already configured in the code!');
console.log('✨ App works immediately after deployment!');
console.log('✨ Use Settings wizard to add Google integration!');
console.log('');
console.log('🎯 Your app will be available at: https://your-project.vercel.app');

// Check if we can access vercel command
try {
  const { execSync } = require('child_process');
  
  // Try to check if user is logged in
  try {
    execSync('npx vercel whoami', { stdio: 'pipe' });
    console.log('');
    console.log('🎉 You are logged in to Vercel!');
    console.log('');
    console.log('Would you like to deploy now? Run:');
    console.log('npx vercel --prod');
  } catch (e) {
    console.log('');
    console.log('ℹ️  Not logged in to Vercel CLI. Use web dashboard instead.');
  }
} catch (e) {
  console.log('');
  console.log('ℹ️  Use web dashboard for deployment.');
}

console.log('');
console.log('📚 Need help? Check DEPLOY_NOW.md');
console.log('🚀 Ready to deploy!');
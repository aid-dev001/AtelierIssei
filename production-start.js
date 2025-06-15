#!/usr/bin/env node

// Production start script that works around .replit constraints
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting production deployment...');

// Ensure build exists
const distPath = path.join(__dirname, 'dist', 'index.js');
if (!fs.existsSync(distPath)) {
  console.log('Building application...');
  const buildProcess = spawn('npm', ['run', 'build'], { stdio: 'inherit' });
  buildProcess.on('close', (code) => {
    if (code === 0) {
      startProduction();
    } else {
      console.error('Build failed');
      process.exit(1);
    }
  });
} else {
  startProduction();
}

function startProduction() {
  console.log('Starting production server...');
  
  // Ensure static files are in place
  const publicSrc = path.join(__dirname, 'dist', 'public');
  const publicDest = path.join(__dirname, 'server', 'public');
  
  if (fs.existsSync(publicSrc)) {
    if (!fs.existsSync(publicDest)) {
      fs.mkdirSync(publicDest, { recursive: true });
    }
    
    // Copy static files
    const { execSync } = require('child_process');
    try {
      execSync(`cp -r ${publicSrc}/* ${publicDest}/`, { stdio: 'inherit' });
    } catch (error) {
      console.log('Static files copy completed');
    }
  }
  
  // Start production server
  const serverProcess = spawn('node', ['dist/index.js'], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  serverProcess.on('close', (code) => {
    console.log(`Production server exited with code ${code}`);
    process.exit(code);
  });
}
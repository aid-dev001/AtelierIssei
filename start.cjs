const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if we're in a deployment environment
const isDeployment = process.env.REPLIT_DEPLOYMENT === '1' || 
                    process.env.NODE_ENV === 'production' ||
                    process.argv.includes('--production');

if (isDeployment) {
  console.log('Production deployment detected');
  
  // Ensure build exists
  if (!fs.existsSync('./dist/index.js')) {
    console.log('Building application...');
    const build = spawn('npm', ['run', 'build'], { stdio: 'inherit' });
    build.on('close', (code) => {
      if (code === 0) startProduction();
      else process.exit(1);
    });
  } else {
    startProduction();
  }
} else {
  // Development mode
  console.log('Starting development server...');
  spawn('tsx', ['watch', '--clear-screen=false', 'server/index.ts'], { stdio: 'inherit' });
}

function startProduction() {
  // Copy static files
  if (fs.existsSync('./dist/public')) {
    if (!fs.existsSync('./server/public')) {
      fs.mkdirSync('./server/public', { recursive: true });
    }
    const { execSync } = require('child_process');
    try {
      execSync('cp -r ./dist/public/* ./server/public/');
    } catch (e) {}
  }
  
  console.log('Starting production server on port 5000...');
  const server = spawn('node', ['./dist/index.js'], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  server.on('close', (code) => process.exit(code));
}
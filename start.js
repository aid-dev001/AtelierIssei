// Smart start script that detects environment and runs appropriate command
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production' || process.env.REPLIT_DEPLOYMENT === '1';
const distExists = fs.existsSync(path.join(__dirname, 'dist', 'index.js'));

if (isProduction) {
  console.log('Production environment detected');
  
  if (!distExists) {
    console.log('Building for production...');
    execSync('npm run build', { stdio: 'inherit' });
  }
  
  // Ensure static files are properly placed
  const publicSrc = path.join(__dirname, 'dist', 'public');
  const publicDest = path.join(__dirname, 'server', 'public');
  
  if (fs.existsSync(publicSrc)) {
    if (!fs.existsSync(path.dirname(publicDest))) {
      fs.mkdirSync(path.dirname(publicDest), { recursive: true });
    }
    try {
      execSync(`cp -r ${publicSrc} ${path.dirname(publicDest)}/`, { stdio: 'pipe' });
    } catch (e) {
      // Ignore copy errors
    }
  }
  
  console.log('Starting production server...');
  process.env.NODE_ENV = 'production';
  import('./dist/index.js');
} else {
  console.log('Development environment detected');
  execSync('tsx watch --clear-screen=false server/index.ts', { stdio: 'inherit' });
}
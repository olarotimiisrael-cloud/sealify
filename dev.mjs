#!/usr/bin/env node
// Local development runner for Sealify with Cloudflare Pages Functions
// Runs both Vite dev server and Wrangler Pages dev server concurrently

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname);

function runCommand(command, args, name, color) {
  const proc = spawn(command, args, {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, FORCE_COLOR: '1' },
  });

  proc.on('error', (err) => {
    console.error(`\x1b[${color}m[${name}]\x1b[0m Failed to start:`, err.message);
  });

  proc.on('exit', (code) => {
    if (code !== 0) {
      console.error(`\x1b[${color}m[${name}]\x1b[0m Exited with code ${code}`);
    }
  });

  return proc;
}

console.log('\x1b[36m[sealify-dev]\x1b[0m Starting development servers...\n');

// Start Wrangler Pages dev server (serves both static assets and Functions)
const wrangler = runCommand('npx', ['wrangler', 'pages', 'dev', './dist', '--port', '8788', '--functions-dir', 'functions', '--compatibility-date', '2026-08-31', '--compatibility-flag', 'nodejs_compat'], 'wrangler', '35');

// Give Wrangler a moment to start
setTimeout(() => {
  // Start Vite dev server
  const vite = runCommand('npx', ['vite', '--port', '5173'], 'vite', '32');

  // Handle shutdown
  const shutdown = () => {
    console.log('\n\x1b[36m[sealify-dev]\x1b[0m Shutting down...');
    vite.kill('SIGTERM');
    wrangler.kill('SIGTERM');
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}, 2000);
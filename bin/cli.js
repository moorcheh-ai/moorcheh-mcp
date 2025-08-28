#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the main server script
const serverPath = join(__dirname, '..', 'src', 'server', 'index.js');

// Get command line arguments (skip node and script name)
const args = process.argv.slice(2);

// Check if user needs help
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Moorcheh MCP Server
===================

Usage: npx @moorchehai/mcp [options]

Options:
  --help, -h     Show this help message
  --version, -v  Show version information

Environment Variables:
  MOORCHEH_API_KEY  Your Moorcheh API key (required)

Examples:
  npx @moorchehai/mcp                    # Start the MCP server
  MOORCHEH_API_KEY=xxx npx @moorchehai/mcp  # Start with API key

For more information, visit: https://github.com/moorcheh-ai/moorcheh-mcp
`);
  process.exit(0);
}

// Check if user wants version
if (args.includes('--version') || args.includes('-v')) {
  const packageJson = await import('../package.json', { with: { type: 'json' } });
  console.log(packageJson.default.version);
  process.exit(0);
}

// Check for API key
if (!process.env.MOORCHEH_API_KEY) {
  console.error(`
❌ Error: Missing MOORCHEH_API_KEY environment variable

Please set your Moorcheh API key:
  MOORCHEH_API_KEY=your_api_key_here npx @moorchehai/mcp

Get your API key at: https://app.moorcheh.ai
`);
  process.exit(1);
}

console.error('🚀 Starting Moorcheh MCP Server...');
console.error('📝 API Key configured ✓');

// Start the main server
const child = spawn('node', [serverPath, ...args], {
  stdio: 'inherit',
  env: process.env
});

child.on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

child.on('close', (code) => {
  process.exit(code);
});

/**
 * Moorcheh MCP Client Test
 * 
 * This script tests the MCP server by sending a tools/list request
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('Moorcheh MCP Client Test');
console.log('============================\n');

// Test the server by sending a tools/list request
async function testMCPConnection() {
  console.log('Testing MCP server connection...');
  
  return new Promise((resolve, reject) => {
    const serverProcess = spawn('node', ['server/index.js'], {
      cwd: projectRoot,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        NODE_ENV: 'test'
      }
    });
    
    let output = '';
    let errorOutput = '';
    let toolsList = [];
    let toolsReceived = false;
    
    serverProcess.stdout.on('data', (data) => {
      const dataStr = data.toString();
      output += dataStr;
      
      // Try to parse JSON responses
      try {
        const lines = dataStr.split('\n').filter(line => line.trim());
        for (const line of lines) {
          const response = JSON.parse(line);
          if (response.result && response.result.tools) {
            toolsList = response.result.tools;
            toolsReceived = true;
            console.log('✅ Received tools list from server');
            console.log(' Available tools:');
            toolsList.forEach(tool => {
              console.log(`   - ${tool.name}: ${tool.description}`);
            });
          }
        }
      } catch (e) {
        // Not JSON, continue
      }
    });
    
    serverProcess.stderr.on('data', (data) => {
      // Only show error output if it's not just "Server started"
      const errorStr = data.toString();
      if (!errorStr.includes('Server started')) {
        errorOutput += errorStr;
      }
    });
    
    serverProcess.on('close', (code) => {
      if (toolsReceived) {
        console.log('✅ MCP server test completed successfully');
        
        // Only show actual errors, not warnings
        if (errorOutput.trim() && !errorOutput.includes('Server started')) {
          console.log('⚠️  Server warnings:', errorOutput.trim());
        }
        
        console.log(`\n🎉 Successfully found ${toolsList.length} tools!`);
        resolve(true);
      } else if (code === 0) {
        console.log('✅ MCP server started successfully');
        
        if (errorOutput.trim() && !errorOutput.includes('Server started')) {
          console.log('⚠️  Server warnings:', errorOutput.trim());
        }
        
        console.log('\n⚠️  No tools found in response');
        resolve(false);
      } else {
        console.log('❌ MCP server failed to start');
        if (errorOutput.trim()) {
          console.log('Error output:', errorOutput.trim());
        }
        reject(new Error(`Server exited with code ${code}`));
      }
    });
    
    serverProcess.on('error', (error) => {
      console.log('❌ Failed to start MCP server:', error.message);
      reject(error);
    });
    
    // Send tools/list request after a short delay
    setTimeout(() => {
      try {
        const toolsListRequest = {
          jsonrpc: "2.0",
          id: 1,
          method: "tools/list"
        };
        
        console.log('Sending tools/list request to server...');
        serverProcess.stdin.write(JSON.stringify(toolsListRequest) + '\n');
      } catch (error) {
        console.log('❌ Failed to send tools/list request:', error.message);
      }
    }, 2000);
    
    // Kill the process after 10 seconds
    setTimeout(() => {
      try {
        serverProcess.kill();
        console.log('🛑 Test completed, shutting down server...');
      } catch (error) {
        console.log('⚠️  Could not kill server process:', error.message);
      }
    }, 10000);
  });
}

// Run the test
testMCPConnection()
  .then((success) => {
    if (success) {
      console.log('\n🎉 MCP server test completed successfully!');
      console.log('\nThe server is ready to use with MCP clients.');
      console.log('\nNext steps:');
      console.log('1. Set up your .env file with MOORCHEH_API_KEY');
      console.log('2. Configure your MCP client (Claude Desktop or Cursor)');
      console.log('3. Start the server with: npm start');
    } else {
      console.log('\n⚠️  MCP server started but no tools were found');
      console.log('This might indicate an issue with tool registration');
    }
  })
  .catch((error) => {
    console.log('\n❌ MCP server test failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure all dependencies are installed: npm install');
    console.log('2. Check that src/server/index.js exists');
    console.log('3. Verify your Node.js version is >= 18.0.0');
    console.log('4. Ensure your .env file has MOORCHEH_API_KEY set');
    process.exit(1);
  }); 
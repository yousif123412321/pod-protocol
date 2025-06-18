// Test script to verify CLI functionality
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

async function testAgentList() {
  try {
    console.log('Testing agent list command...');
    const { stdout, stderr } = await execAsync('node ./cli/dist/index.js agent list', {
      cwd: '/home/blind/PoD-Protocol-1',
      env: { ...process.env, NODE_OPTIONS: '--no-warnings' }
    });
    
    console.log('✅ Agent list command executed successfully!');
    console.log('Output:', stdout);
  } catch (error) {
    console.error('❌ Error executing agent list command:');
    console.error('Error:', error.message);
    console.error('Stderr:', error.stderr || 'No stderr');
    console.error('Stdout:', error.stdout || 'No stdout');
  }
}

// Run the test
testAgentList();

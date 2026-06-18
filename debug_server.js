const { spawn } = require('child_process');
const fs = require('fs');

const child = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['run', 'dev'], { cwd: __dirname });

let output = '';
let hasWritten = false;

function writeOutput() {
  if (hasWritten) return;
  hasWritten = true;
  fs.writeFileSync('debug_output.json', JSON.stringify({ output }));
  child.kill();
  process.exit(0);
}

child.stdout.on('data', (data) => {
  output += data.toString();
  if (output.includes('Ready in') || output.includes('ready started server') || output.includes('Error') || output.length > 5000) {
    setTimeout(writeOutput, 2000);
  }
});

child.stderr.on('data', (data) => {
  output += data.toString();
  setTimeout(writeOutput, 2000);
});

child.on('error', (err) => {
  output += err.toString();
  writeOutput();
});

child.on('close', (code) => {
  output += `\nProcess exited with code ${code}`;
  writeOutput();
});

setTimeout(writeOutput, 15000); // Failsafe timeout

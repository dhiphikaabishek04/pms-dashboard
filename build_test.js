const { execSync } = require('child_process');
const fs = require('fs');
try {
  const output = execSync('npm run build', { cwd: 'd:/OneDrive - REDINGTON/PMS/pms', encoding: 'utf8', stdio: 'pipe' });
  fs.writeFileSync('d:/OneDrive - REDINGTON/PMS/pms/build_output.txt', output);
} catch (e) {
  fs.writeFileSync('d:/OneDrive - REDINGTON/PMS/pms/build_output.txt', (e.stdout || '') + '\n' + (e.stderr || '') + '\n' + e.message);
}

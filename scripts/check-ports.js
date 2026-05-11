const { execSync } = require('child_process');
const os = require('os');

const ports = [3001, 5173]; // backend and frontend ports

function killProcessOnPort(port) {
  const platform = os.platform();
  const killedPids = new Set();
  
  try {
    if (platform === 'win32') {
      // Windows
      const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf-8' });
      const lines = result.trim().split('\n');
      
      for (const line of lines) {
        if (line.includes('LISTENING')) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          
          if (pid && !isNaN(pid) && !killedPids.has(pid)) {
            killedPids.add(pid);
            console.log(`🔍 Found process ${pid} using port ${port}`);
            try {
              execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
              console.log(`✅ Killed process ${pid} on port ${port}`);
            } catch (error) {
              console.log(`⚠️  Could not kill process ${pid} (may require admin rights)`);
            }
          }
        }
      }
    } else {
      // Linux/Mac
      try {
        const pid = execSync(`lsof -ti:${port}`, { encoding: 'utf-8' }).trim();
        if (pid && !killedPids.has(pid)) {
          killedPids.add(pid);
          console.log(`🔍 Found process ${pid} using port ${port}`);
          execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
          console.log(`✅ Killed process ${pid} on port ${port}`);
        }
      } catch (error) {
        // Port is free, no process found
      }
    }
  } catch (error) {
    // Port is free or no process found
  }
  
  if (killedPids.size === 0) {
    console.log(`✅ Port ${port} is free`);
  }
}

console.log('🔍 Checking for processes using ports 3001 and 5173...\n');

ports.forEach(port => {
  killProcessOnPort(port);
});

console.log('\n✅ Port check complete. Starting servers...\n');

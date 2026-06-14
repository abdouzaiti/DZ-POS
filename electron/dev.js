import { spawn } from 'child_process';
import net from 'net';

// Helper to check if a TCP port is open (meaning Vite dev server is ready to accept connections)
const checkPort = (port, host = '127.0.0.1') => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const onError = () => {
      socket.destroy();
      resolve(false);
    };

    socket.setTimeout(1000);
    socket.once('error', onError);
    socket.once('timeout', onError);

    socket.connect(port, host, () => {
      socket.end();
      resolve(true);
    });
  });
};

const start = async () => {
  console.log('🚀 Starting Vite Development Server...');
  
  const isWindows = process.platform === 'win32';
  const npmCmd = isWindows ? 'npm.cmd' : 'npm';
  const npxCmd = isWindows ? 'npx.cmd' : 'npx';

  // Spawn the Vite dev server
  const viteProcess = spawn(npmCmd, ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd(),
    env: {
      ...process.env,
      ELECTRON_MIRROR: 'https://npmmirror.com/mirrors/electron/',
      ELECTRON_BUILDER_BINARIES_MIRROR: 'https://npmmirror.com/mirrors/electron-builder-binaries/'
    }
  });

  // Terminate Vite if this parent dev script is killed
  process.on('SIGINT', () => {
    viteProcess.kill('SIGINT');
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    viteProcess.kill('SIGTERM');
    process.exit(0);
  });

  // Wait for port 3000 to be open
  let viteReady = false;
  console.log('⏳ Waiting for Vite dev server to start on port 3000...');
  
  for (let i = 0; i < 45; i++) { // try for up to 45 seconds
    viteReady = await checkPort(3000);
    if (viteReady) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  if (!viteReady) {
    console.error('❌ Vite development server failed to start on port 3000 within 45 seconds.');
    viteProcess.kill();
    process.exit(1);
  }

  console.log('✅ Vite server is online! Launching Electron desktop window...');

  // Spawn Electron targeting electron/main.js
  const electronProcess = spawn(npxCmd, ['electron', 'electron/main.js'], {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd(),
    env: {
      ...process.env,
      ELECTRON_MIRROR: 'https://npmmirror.com/mirrors/electron/',
      ELECTRON_BUILDER_BINARIES_MIRROR: 'https://npmmirror.com/mirrors/electron-builder-binaries/'
    }
  });

  // When Electron closes, terminate the Vite background process cleanly
  electronProcess.on('close', (code) => {
    console.log(`👋 Electron window closed (code ${code}). Stopping Vite server...`);
    viteProcess.kill();
    process.exit(code || 0);
  });

  viteProcess.on('close', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`❌ Vite server stopped unexpectedly with code ${code}`);
      electronProcess.kill();
      process.exit(code);
    }
  });
};

start().catch((err) => {
  console.error('Failed to start development environment:', err);
  process.exit(1);
});

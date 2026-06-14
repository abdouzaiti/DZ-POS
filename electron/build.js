import { spawn } from 'child_process';

const spawnProcess = (command, args) => {
  return new Promise((resolve, reject) => {
    const isWindows = process.platform === 'win32';
    const cmd = isWindows ? `${command}.cmd` : command;
    
    console.log(`\n📦 Running: ${command} ${args.join(' ')}`);
    const proc = spawn(cmd, args, {
      stdio: 'inherit',
      shell: true,
      cwd: process.cwd(),
      env: {
        ...process.env,
        ELECTRON_MIRROR: 'https://npmmirror.com/mirrors/electron/',
        ELECTRON_BUILDER_BINARIES_MIRROR: 'https://npmmirror.com/mirrors/electron-builder-binaries/'
      }
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command "${command}" failed with exit code ${code}`));
      }
    });
  });
};

const build = async () => {
  try {
    // 1. Run vite build
    await spawnProcess('npx', ['vite', 'build']);
    
    // 2. Run electron-builder
    await spawnProcess('npx', ['electron-builder']);
    
    console.log('\n✨ Desktop build completed successfully!');
  } catch (error) {
    console.error('\n❌ Build failed:', error.message);
    process.exit(1);
  }
};

build();

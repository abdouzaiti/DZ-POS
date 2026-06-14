import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve directory paths since we are package-ready ESM/CJS
const isDev = !app.isPackaged;
const userDataPath = app.getPath('userData');
const dbFile = path.join(userDataPath, 'propos_market.db');
const jsonFallbackFile = path.join(userDataPath, 'propos_market_db.json');

console.log('Database path:', dbFile);
console.log('JSON storage fallback:', jsonFallbackFile);

// Dynamic database interface supporting SQLite vs JSON storage fallback
let dbType = 'json'; // default fallback
let dbConnection = null;

// Initialize Database using either SQLite or JSON filesystem fallback
const initDatabase = () => {
  try {
    // Attempt to load sqlite3 or better-sqlite3 dynamically
    // This makes the project fully generic to build on different developer machines!
    let sqlite3;
    try {
      sqlite3 = require('sqlite3').verbose();
    } catch {
      try {
        const betterSqlite = require('better-sqlite3');
        dbConnection = new betterSqlite(dbFile);
        dbType = 'better-sqlite3';
      } catch {
        console.warn('SQLite module not found locally. Running with ultra-safe JSON File Database fallback...');
        dbType = 'json';
      }
    }

    if (sqlite3) {
      dbConnection = new sqlite3.Database(dbFile);
      dbType = 'sqlite3';
    }

    if (dbType === 'sqlite3') {
      // Create tables for sqlite3
      dbConnection.serialize(() => {
        dbConnection.run(`
          CREATE TABLE IF NOT EXISTS store_data (
            key TEXT PRIMARY KEY,
            value TEXT
          )
        `);
      });
      console.log('SQLite3 Database Initialized Successfully!');
    } else if (dbType === 'better-sqlite3') {
      dbConnection.prepare(`
        CREATE TABLE IF NOT EXISTS store_data (
          key TEXT PRIMARY KEY,
          value TEXT
        )
      `).run();
      console.log('Better-SQLite3 Database Initialized Successfully!');
    } else {
      // Ensure local JSON storage structure exists
      if (!fs.existsSync(jsonFallbackFile)) {
        fs.writeFileSync(jsonFallbackFile, JSON.stringify({
          products: [],
          sales: [],
          credits: [],
          settings: {}
        }, null, 2));
      }
      console.log('JSON File Database Initialized Successfully!');
    }
  } catch (err) {
    console.error('Failed to initialize database, defaulting to JSON:', err);
    dbType = 'json';
    if (!fs.existsSync(jsonFallbackFile)) {
      fs.writeFileSync(jsonFallbackFile, JSON.stringify({
        products: [],
        sales: [],
        credits: [],
        settings: {}
      }, null, 2));
    }
  }
};

// Generic get operator
const getItem = (key, defaultValue = '[]') => {
  return new Promise((resolve) => {
    if (dbType === 'sqlite3') {
      dbConnection.get('SELECT value FROM store_data WHERE key = ?', [key], (err, row) => {
        if (err || !row) {
          resolve(JSON.parse(defaultValue));
        } else {
          try {
            resolve(JSON.parse(row.value));
          } catch {
            resolve(JSON.parse(defaultValue));
          }
        }
      });
    } else if (dbType === 'better-sqlite3') {
      try {
        const row = dbConnection.prepare('SELECT value FROM store_data WHERE key = ?').get(key);
        if (row) {
          resolve(JSON.parse(row.value));
        } else {
          resolve(JSON.parse(defaultValue));
        }
      } catch {
        resolve(JSON.parse(defaultValue));
      }
    } else {
      // JSON Mode
      try {
        const fileContent = fs.readFileSync(jsonFallbackFile, 'utf8');
        const data = JSON.parse(fileContent);
        resolve(data[key] || JSON.parse(defaultValue));
      } catch {
        resolve(JSON.parse(defaultValue));
      }
    }
  });
};

// Generic set operator
const setItem = (key, value) => {
  return new Promise((resolve, reject) => {
    const valueString = JSON.stringify(value);
    if (dbType === 'sqlite3') {
      dbConnection.run(
        'INSERT INTO store_data (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
        [key, valueString],
        (err) => {
          if (err) {
            console.error('Error writing to SQLite3:', err);
            reject(err);
          } else {
            resolve();
          }
        }
      );
    } else if (dbType === 'better-sqlite3') {
      try {
        dbConnection.prepare(
          'INSERT INTO store_data (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
        ).run(key, valueString);
        resolve();
      } catch (err) {
        console.error('Error writing to better-sqlite3:', err);
        reject(err);
      }
    } else {
      // JSON Mode
      try {
        const fileContent = fs.readFileSync(jsonFallbackFile, 'utf8');
        const data = JSON.parse(fileContent);
        data[key] = value;
        fs.writeFileSync(jsonFallbackFile, JSON.stringify(data, null, 2));
        resolve();
      } catch (err) {
        console.error('Error writing to JSON DB:', err);
        reject(err);
      }
    }
  });
};

// Initialize app when electron is ready
let mainWindow = null;

const createWindow = () => {
  initDatabase();

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "PRO POS MARKET",
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Remove default menu for cleaner professional looking software
  mainWindow.setMenuBarVisibility(false);

  if (isDev) {
    // If in development mode, load Vite UI
    mainWindow.loadURL('http://localhost:3000');
    // Open dev tools in background
    mainWindow.webContents.openDevTools();
  } else {
    // In production, render built assets inside build directory
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Configure Electron interprocess communications (IPC)
ipcMain.handle('get-products', async () => {
  return await getItem('products', '[]');
});

ipcMain.handle('save-products', async (event, products) => {
  await setItem('products', products);
  return true;
});

ipcMain.handle('get-sales', async () => {
  return await getItem('sales', '[]');
});

ipcMain.handle('save-sales', async (event, sales) => {
  await setItem('sales', sales);
  return true;
});

ipcMain.handle('get-credits', async () => {
  return await getItem('credits', '[]');
});

ipcMain.handle('save-credits', async (event, credits) => {
  await setItem('credits', credits);
  return true;
});

ipcMain.handle('get-settings', async () => {
  return await getItem('settings', '{}');
});

ipcMain.handle('save-settings', async (event, settings) => {
  await setItem('settings', settings);
  return true;
});

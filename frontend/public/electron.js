const { app, BrowserWindow, Menu } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let mainWindow;
let backendProcess;

// Start the Node.js backend server
function startBackend() {
  const backendPath = path.join(__dirname, '../../backend');
  
  backendProcess = spawn('node', ['server.js'], {
    cwd: backendPath,
    stdio: 'inherit',
  });

  backendProcess.on('error', (err) => {
    console.error('Failed to start backend:', err);
  });

  // Give backend time to start
  return new Promise(resolve => setTimeout(resolve, 2000));
}

// Create the Electron window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Check if running in dev or production
  const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');
  
  let startUrl;
  if (isDev) {
    startUrl = 'http://localhost:3000';
  } else {
    // In production, load from the dist folder
    const indexPath = path.join(__dirname, '../dist/index.html');
    startUrl = `file://${indexPath}`;
  }

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App event handlers
app.on('ready', async () => {
  console.log('Starting BIGBREW Ordering System...');
  
  // Start backend first
  await startBackend();
  
  // Then create window
  createWindow();

  // Create menu
  createMenu();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Kill backend process when app closes
app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});

// Create application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.reload();
          },
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'CmdOrCtrl+Shift+I',
          click: () => {
            mainWindow.webContents.toggleDevTools();
          },
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

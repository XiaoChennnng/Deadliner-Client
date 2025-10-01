const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const StorageService = require('./storage');

let mainWindow;
let storageService;

function createWindow() {
  // Remove the application menu
  Menu.setApplicationMenu(null);

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'default',
    backgroundColor: '#FEF7FF',
    show: false,
  });

  // Load the app
  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadURL(startUrl);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development (commented out for cleaner startup)
  // if (isDev) {
  //   mainWindow.webContents.openDevTools();
  // }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  // Initialize storage service
  storageService = new StorageService();

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // Close storage before quitting
  if (storageService) {
    storageService.close();
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle IPC events for storage operations
// Tasks
ipcMain.handle('storage:getTasks', async () => {
  return await storageService.getTasks();
});

ipcMain.handle('storage:getTask', async (event, id) => {
  return await storageService.getTask(id);
});

ipcMain.handle('storage:createTask', async (event, task) => {
  return await storageService.createTask(task);
});

ipcMain.handle('storage:updateTask', async (event, id, updates) => {
  return await storageService.updateTask(id, updates);
});

ipcMain.handle('storage:deleteTask', async (event, id) => {
  return await storageService.deleteTask(id);
});

ipcMain.handle('storage:archiveTask', async (event, id) => {
  return await storageService.archiveTask(id);
});

ipcMain.handle('storage:unarchiveTask', async (event, id) => {
  return await storageService.unarchiveTask(id);
});

ipcMain.handle('storage:batchUpdateTasks', async (event, ids, updates) => {
  return await storageService.batchUpdateTasks(ids, updates);
});

// Categories
ipcMain.handle('storage:getCategories', async () => {
  return await storageService.getCategories();
});

ipcMain.handle('storage:createCategory', async (event, category) => {
  return await storageService.createCategory(category);
});

// Habit checkins
ipcMain.handle('storage:createHabitCheckin', async (event, checkin) => {
  return await storageService.createHabitCheckin(checkin);
});

ipcMain.handle('storage:getHabitCheckins', async (event, taskId, startDate, endDate) => {
  return await storageService.getHabitCheckins(taskId, startDate, endDate);
});

// Stats
ipcMain.handle('storage:getStats', async () => {
  return await storageService.getStats();
});

// Settings
ipcMain.handle('storage:getSetting', async (event, key, defaultValue) => {
  return await storageService.getSetting(key, defaultValue);
});

ipcMain.handle('storage:setSetting', async (event, key, value) => {
  return await storageService.setSetting(key, value);
});

ipcMain.handle('storage:getSecureSetting', async (event, key, defaultValue) => {
  return await storageService.getSecureSetting(key, defaultValue);
});

ipcMain.handle('storage:setSecureSetting', async (event, key, value) => {
  return await storageService.setSecureSetting(key, value);
});

ipcMain.handle('storage:getUISettings', async () => {
  return await storageService.getUISettings();
});

ipcMain.handle('storage:setUISettings', async (event, settings) => {
  return await storageService.setUISettings(settings);
});

ipcMain.handle('storage:getNotificationSettings', async () => {
  return await storageService.getNotificationSettings();
});

ipcMain.handle('storage:setNotificationSettings', async (event, settings) => {
  return await storageService.setNotificationSettings(settings);
});

ipcMain.handle('storage:getSyncSettings', async () => {
  return await storageService.getSyncSettings();
});

ipcMain.handle('storage:setSyncSettings', async (event, settings) => {
  return await storageService.setSyncSettings(settings);
});

ipcMain.handle('storage:getFeatureSettings', async () => {
  return await storageService.getFeatureSettings();
});

ipcMain.handle('storage:setFeatureSettings', async (event, settings) => {
  return await storageService.setFeatureSettings(settings);
});

ipcMain.handle('storage:getAISettings', async () => {
  return await storageService.getAISettings();
});

ipcMain.handle('storage:setAISettings', async (event, settings) => {
  return await storageService.setAISettings(settings);
});

ipcMain.handle('storage:getUserPreferences', async () => {
  return await storageService.getUserPreferences();
});

ipcMain.handle('storage:setUserPreferences', async (event, preferences) => {
  return await storageService.setUserPreferences(preferences);
});

ipcMain.handle('storage:getAppInfo', async () => {
  return await storageService.getAppInfo();
});

// Backup & Restore
ipcMain.handle('storage:exportData', async () => {
  return await storageService.exportData();
});

ipcMain.handle('storage:importData', async (event, data) => {
  return await storageService.importData(data);
});

ipcMain.handle('storage:getStorageInfo', async () => {
  return storageService.getStorageInfo();
});

// App version
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

// Security: Prevent navigation to external URLs
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);

    // Allow navigation only to localhost in development
    if (isDev && parsedUrl.origin === 'http://localhost:3000') {
      return;
    }

    // Prevent all other navigation
    if (parsedUrl.origin !== `file://`) {
      event.preventDefault();
    }
  });

  // Prevent new window creation
  contents.setWindowOpenHandler(({ url }) => {
    return { action: 'deny' };
  });
});

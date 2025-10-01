const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // App version
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  // Platform info
  platform: process.platform,

  // Storage API - Tasks
  storage: {
    // Tasks
    getTasks: () => ipcRenderer.invoke('storage:getTasks'),
    getTask: (id) => ipcRenderer.invoke('storage:getTask', id),
    createTask: (task) => ipcRenderer.invoke('storage:createTask', task),
    updateTask: (id, updates) => ipcRenderer.invoke('storage:updateTask', id, updates),
    deleteTask: (id) => ipcRenderer.invoke('storage:deleteTask', id),
    archiveTask: (id) => ipcRenderer.invoke('storage:archiveTask', id),
    unarchiveTask: (id) => ipcRenderer.invoke('storage:unarchiveTask', id),
    batchUpdateTasks: (ids, updates) => ipcRenderer.invoke('storage:batchUpdateTasks', ids, updates),

    // Categories
    getCategories: () => ipcRenderer.invoke('storage:getCategories'),
    createCategory: (category) => ipcRenderer.invoke('storage:createCategory', category),

    // Habit checkins
    createHabitCheckin: (checkin) => ipcRenderer.invoke('storage:createHabitCheckin', checkin),
    getHabitCheckins: (taskId, startDate, endDate) => ipcRenderer.invoke('storage:getHabitCheckins', taskId, startDate, endDate),

    // Stats
    getStats: () => ipcRenderer.invoke('storage:getStats'),

    // Settings
    getSetting: (key, defaultValue) => ipcRenderer.invoke('storage:getSetting', key, defaultValue),
    setSetting: (key, value) => ipcRenderer.invoke('storage:setSetting', key, value),
    getSecureSetting: (key, defaultValue) => ipcRenderer.invoke('storage:getSecureSetting', key, defaultValue),
    setSecureSetting: (key, value) => ipcRenderer.invoke('storage:setSecureSetting', key, value),

    // Specific settings
    getUISettings: () => ipcRenderer.invoke('storage:getUISettings'),
    setUISettings: (settings) => ipcRenderer.invoke('storage:setUISettings', settings),
    getNotificationSettings: () => ipcRenderer.invoke('storage:getNotificationSettings'),
    setNotificationSettings: (settings) => ipcRenderer.invoke('storage:setNotificationSettings', settings),
    getSyncSettings: () => ipcRenderer.invoke('storage:getSyncSettings'),
    setSyncSettings: (settings) => ipcRenderer.invoke('storage:setSyncSettings', settings),
    getFeatureSettings: () => ipcRenderer.invoke('storage:getFeatureSettings'),
    setFeatureSettings: (settings) => ipcRenderer.invoke('storage:setFeatureSettings', settings),
    getAISettings: () => ipcRenderer.invoke('storage:getAISettings'),
    setAISettings: (settings) => ipcRenderer.invoke('storage:setAISettings', settings),
    getUserPreferences: () => ipcRenderer.invoke('storage:getUserPreferences'),
    setUserPreferences: (preferences) => ipcRenderer.invoke('storage:setUserPreferences', preferences),
    getAppInfo: () => ipcRenderer.invoke('storage:getAppInfo'),

    // Backup & Restore
    exportData: () => ipcRenderer.invoke('storage:exportData'),
    importData: (data) => ipcRenderer.invoke('storage:importData', data),
    getStorageInfo: () => ipcRenderer.invoke('storage:getStorageInfo'),
  },
});


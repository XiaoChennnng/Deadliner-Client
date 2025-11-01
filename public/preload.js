const { contextBridge, ipcRenderer } = require('electron');

// 暴露受保护的方法，允许渲染进程使用
// ipcRenderer而不暴露整个对象
contextBridge.exposeInMainWorld('electron', {
  // 应用版本
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  // 平台信息
  platform: process.platform,

  // 存储API - 任务
  storage: {
    // 任务相关
    getTasks: () => ipcRenderer.invoke('storage:getTasks'),
    clearAllTasks: () => ipcRenderer.invoke('storage:clearAllTasks'),
    getTask: (id) => ipcRenderer.invoke('storage:getTask', id),
    createTask: (task) => ipcRenderer.invoke('storage:createTask', task),
    updateTask: (id, updates) => ipcRenderer.invoke('storage:updateTask', id, updates),
    deleteTask: (id) => ipcRenderer.invoke('storage:deleteTask', id),
    archiveTask: (id) => ipcRenderer.invoke('storage:archiveTask', id),
    unarchiveTask: (id) => ipcRenderer.invoke('storage:unarchiveTask', id),
    batchUpdateTasks: (ids, updates) => ipcRenderer.invoke('storage:batchUpdateTasks', ids, updates),

    // 分类相关
    getCategories: () => ipcRenderer.invoke('storage:getCategories'),
    createCategory: (category) => ipcRenderer.invoke('storage:createCategory', category),

    // 习惯打卡相关
    createHabitCheckin: (checkin) => ipcRenderer.invoke('storage:createHabitCheckin', checkin),
    getHabitCheckins: (taskId, startDate, endDate) => ipcRenderer.invoke('storage:getHabitCheckins', taskId, startDate, endDate),

    // 统计相关
    getStats: () => ipcRenderer.invoke('storage:getStats'),

    // 设置相关
    getSetting: (key, defaultValue) => ipcRenderer.invoke('storage:getSetting', key, defaultValue),
    setSetting: (key, value) => ipcRenderer.invoke('storage:setSetting', key, value),
    getSecureSetting: (key, defaultValue) => ipcRenderer.invoke('storage:getSecureSetting', key, defaultValue),
    setSecureSetting: (key, value) => ipcRenderer.invoke('storage:setSecureSetting', key, value),

    // 具体设置项
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

    // 备份与恢复
    exportData: () => ipcRenderer.invoke('storage:exportData'),
    importData: (data) => ipcRenderer.invoke('storage:importData', data),
    getStorageInfo: () => ipcRenderer.invoke('storage:getStorageInfo'),

    // WebDAV同步
    webdavTestConnection: () => ipcRenderer.invoke('storage:webdavTestConnection'),
    webdavUploadBackup: () => ipcRenderer.invoke('storage:webdavUploadBackup'),
    webdavDownloadBackup: () => ipcRenderer.invoke('storage:webdavDownloadBackup'),
    webdavDownloadSnapshot: () => ipcRenderer.invoke('storage:webdavDownloadSnapshot'),
  },
});


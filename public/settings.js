const Store = require('electron-store').default;
const crypto = require('crypto');

/**
 * SecureSettingsManager - 加密配置管理类
 * 参考Android端的KeystorePreferencesManager，使用加密存储敏感数据
 */
class SecureSettingsManager {
  constructor() {
    if (SecureSettingsManager.instance) {
      return SecureSettingsManager.instance;
    }

    // 普通配置存储（非敏感数据）
    this.store = new Store({
      name: 'app_settings',
      encryptionKey: undefined // 非敏感数据不加密
    });

    // 加密配置存储（敏感数据）
    this.secureStore = new Store({
      name: 'secure_settings',
      encryptionKey: this.getOrCreateEncryptionKey()
    });

    this.initDefaultSettings();
    SecureSettingsManager.instance = this;
  }

  /**
   * 获取或创建加密密钥
   * 密钥存储在系统级别，参考Android Keystore的设计
   */
  getOrCreateEncryptionKey() {
    const keyStore = new Store({ name: 'keystore' });
    let encryptionKey = keyStore.get('encryption_key');

    if (!encryptionKey) {
      // 生成256位随机密钥
      encryptionKey = crypto.randomBytes(32).toString('hex');
      keyStore.set('encryption_key', encryptionKey);
    }

    return encryptionKey;
  }

  /**
   * 初始化默认设置
   */
  initDefaultSettings() {
    const defaults = {
      // 界面设置
      ui: {
        progressDirection: 'horizontal',
        enableAnimations: true,
        theme: 'auto', // 'light' | 'dark' | 'auto'
        language: 'zh-CN',
        fontSize: 'medium',
        sidebarCollapsed: false,
      },

      // 通知设置
      notifications: {
        enabled: true,
        deadlineReminder: true,
        dailyStats: true,
        weeklyReport: false,
        sound: true,
        vibration: false,
        reminderAdvance: 60, // 提前60分钟提醒
      },

      // 同步设置
      sync: {
        enabled: false,
        provider: 'webdav', // 'webdav' | 'local' | 'cloud'
        autoSync: true,
        syncInterval: 30, // 分钟
        lastSyncTime: null,
        webdav: {
          url: '',
          username: '',
          // password 存储在 secureStore
        },
      },

      // 功能开关
      features: {
        autoArchive: true,
        autoArchiveDays: 30,
        aiEnabled: false,
        aiProvider: 'openai', // 'openai' | 'claude' | 'local'
        habitTracking: true,
        statistics: true,
        backup: true,
        autoBackupInterval: 7, // 天
      },

      // 用户偏好
      preferences: {
        startPage: 'dashboard',
        taskSortBy: 'deadline',
        defaultTaskType: 'task',
        defaultPriority: 'medium',
        defaultCategory: 'personal',
        confirmDelete: true,
        confirmComplete: false,
      },

      // 应用设置
      app: {
        version: '0.1.0',
        firstRun: true,
        installDate: Date.now(),
        launchCount: 0,
        lastLaunchTime: null,
      },
    };

    // 只设置未存在的默认值
    for (const [section, settings] of Object.entries(defaults)) {
      if (!this.store.has(section)) {
        this.store.set(section, settings);
      } else {
        // 合并新的默认值（保留用户已有设置）
        const current = this.store.get(section);
        const merged = { ...settings, ...current };
        this.store.set(section, merged);
      }
    }
  }

  // ==================== 普通设置操作 ====================

  /**
   * 获取设置值
   */
  get(key, defaultValue) {
    return this.store.get(key, defaultValue);
  }

  /**
   * 设置值
   */
  set(key, value) {
    this.store.set(key, value);
  }

  /**
   * 删除设置
   */
  delete(key) {
    this.store.delete(key);
  }

  /**
   * 检查设置是否存在
   */
  has(key) {
    return this.store.has(key);
  }

  /**
   * 获取所有设置
   */
  getAll() {
    return this.store.store;
  }

  /**
   * 清空所有普通设置
   */
  clear() {
    this.store.clear();
    this.initDefaultSettings();
  }

  // ==================== 加密设置操作 ====================

  /**
   * 获取加密存储的敏感数据
   */
  getSecure(key, defaultValue) {
    return this.secureStore.get(key, defaultValue);
  }

  /**
   * 设置加密存储的敏感数据
   */
  setSecure(key, value) {
    this.secureStore.set(key, value);
  }

  /**
   * 删除加密数据
   */
  deleteSecure(key) {
    this.secureStore.delete(key);
  }

  /**
   * 检查加密数据是否存在
   */
  hasSecure(key) {
    return this.secureStore.has(key);
  }

  // ==================== 便捷方法 ====================

  /**
   * UI设置
   */
  getUISettings() {
    return this.get('ui');
  }

  setUISettings(settings) {
    const current = this.get('ui');
    this.set('ui', { ...current, ...settings });
  }

  /**
   * 通知设置
   */
  getNotificationSettings() {
    return this.get('notifications');
  }

  setNotificationSettings(settings) {
    const current = this.get('notifications');
    this.set('notifications', { ...current, ...settings });
  }

  /**
   * 同步设置
   */
  getSyncSettings() {
    const settings = this.get('sync');
    // 从加密存储获取密码
    if (settings.provider === 'webdav') {
      settings.webdav.password = this.getSecure('sync.webdav.password', '');
    }
    return settings;
  }

  setSyncSettings(settings) {
    const current = this.get('sync');

    // 分离敏感数据
    if (settings.webdav && settings.webdav.password) {
      this.setSecure('sync.webdav.password', settings.webdav.password);
      delete settings.webdav.password;
    }

    this.set('sync', { ...current, ...settings });
  }

  /**
   * 功能设置
   */
  getFeatureSettings() {
    return this.get('features');
  }

  setFeatureSettings(settings) {
    const current = this.get('features');
    this.set('features', { ...current, ...settings });
  }

  /**
   * AI设置
   */
  getAISettings() {
    const features = this.get('features');
    return {
      enabled: features.aiEnabled,
      provider: features.aiProvider,
      apiKey: this.getSecure('ai.apiKey', ''),
      model: this.getSecure('ai.model', 'gpt-3.5-turbo'),
      temperature: this.getSecure('ai.temperature', 0.7),
      maxTokens: this.getSecure('ai.maxTokens', 2000),
    };
  }

  setAISettings(settings) {
    // 更新功能开关
    if (settings.enabled !== undefined) {
      const features = this.get('features');
      features.aiEnabled = settings.enabled;
      this.set('features', features);
    }

    if (settings.provider !== undefined) {
      const features = this.get('features');
      features.aiProvider = settings.provider;
      this.set('features', features);
    }

    // 存储敏感数据
    if (settings.apiKey !== undefined) {
      this.setSecure('ai.apiKey', settings.apiKey);
    }
    if (settings.model !== undefined) {
      this.setSecure('ai.model', settings.model);
    }
    if (settings.temperature !== undefined) {
      this.setSecure('ai.temperature', settings.temperature);
    }
    if (settings.maxTokens !== undefined) {
      this.setSecure('ai.maxTokens', settings.maxTokens);
    }
  }

  /**
   * 用户偏好
   */
  getUserPreferences() {
    return this.get('preferences');
  }

  setUserPreferences(preferences) {
    const current = this.get('preferences');
    this.set('preferences', { ...current, ...preferences });
  }

  /**
   * 更新应用启动统计
   */
  updateAppLaunch() {
    const app = this.get('app');
    app.launchCount += 1;
    app.lastLaunchTime = Date.now();
    app.firstRun = false;
    this.set('app', app);
  }

  /**
   * 获取应用信息
   */
  getAppInfo() {
    return this.get('app');
  }

  /**
   * 导出所有设置（用于备份）
   * 注意：敏感数据不会被导出
   */
  exportSettings() {
    return {
      ...this.store.store,
      exportedAt: Date.now(),
      version: this.get('app.version'),
    };
  }

  /**
   * 导入设置（用于恢复）
   */
  importSettings(settings) {
    if (!settings || typeof settings !== 'object') {
      throw new Error('Invalid settings data');
    }

    // 移除元数据
    delete settings.exportedAt;
    delete settings.version;

    // 导入设置
    for (const [key, value] of Object.entries(settings)) {
      this.set(key, value);
    }
  }

  /**
   * 重置所有设置为默认值
   */
  reset() {
    this.store.clear();
    this.secureStore.clear();
    this.initDefaultSettings();
  }

  /**
   * 获取存储路径（用于调试）
   */
  getStorePath() {
    return {
      settings: this.store.path,
      secure: this.secureStore.path,
    };
  }
}

module.exports = SecureSettingsManager;

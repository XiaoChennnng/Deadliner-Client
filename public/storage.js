const DatabaseHelper = require('./database');
const SecureSettingsManager = require('./settings');

/**
 * StorageService - 存储服务门面类
 * 统一管理数据库和配置存储，提供给渲染进程使用的API
 */
class StorageService {
  constructor() {
    if (StorageService.instance) {
      return StorageService.instance;
    }

    this.db = new DatabaseHelper();
    this.settings = new SecureSettingsManager();

    // 更新应用启动统计
    this.settings.updateAppLaunch();

    StorageService.instance = this;
  }

  // ==================== 任务API ====================

  async getTasks() {
    try {
      return this.db.getAllTasks();
    } catch (error) {
      console.error('Error getting tasks:', error);
      throw error;
    }
  }

  async getTask(id) {
    try {
      return this.db.getTaskById(id);
    } catch (error) {
      console.error('Error getting task:', error);
      throw error;
    }
  }

  async createTask(task) {
    try {
      this.db.createTask(task);
      return { success: true };
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async updateTask(id, updates) {
    try {
      this.db.updateTask(id, updates);
      return { success: true };
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  async deleteTask(id) {
    try {
      this.db.deleteTask(id);
      return { success: true };
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  async archiveTask(id) {
    try {
      this.db.archiveTask(id);
      return { success: true };
    } catch (error) {
      console.error('Error archiving task:', error);
      throw error;
    }
  }

  async unarchiveTask(id) {
    try {
      this.db.unarchiveTask(id);
      return { success: true };
    } catch (error) {
      console.error('Error unarchiving task:', error);
      throw error;
    }
  }

  async batchUpdateTasks(ids, updates) {
    try {
      this.db.batchUpdateTasks(ids, updates);
      return { success: true };
    } catch (error) {
      console.error('Error batch updating tasks:', error);
      throw error;
    }
  }

  // ==================== 分类API ====================

  async getCategories() {
    try {
      return this.db.getAllCategories();
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  }

  async createCategory(category) {
    try {
      this.db.createCategory(category);
      return { success: true };
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  // ==================== 习惯打卡API ====================

  async createHabitCheckin(checkin) {
    try {
      this.db.createHabitCheckin(checkin);
      return { success: true };
    } catch (error) {
      console.error('Error creating habit checkin:', error);
      throw error;
    }
  }

  async getHabitCheckins(taskId, startDate, endDate) {
    try {
      return this.db.getHabitCheckins(taskId, startDate, endDate);
    } catch (error) {
      console.error('Error getting habit checkins:', error);
      throw error;
    }
  }

  // ==================== 统计API ====================

  async getStats() {
    try {
      return this.db.getStats();
    } catch (error) {
      console.error('Error getting stats:', error);
      throw error;
    }
  }

  // ==================== 设置API ====================

  async getSetting(key, defaultValue) {
    try {
      return this.settings.get(key, defaultValue);
    } catch (error) {
      console.error('Error getting setting:', error);
      throw error;
    }
  }

  async setSetting(key, value) {
    try {
      this.settings.set(key, value);
      return { success: true };
    } catch (error) {
      console.error('Error setting value:', error);
      throw error;
    }
  }

  async getSecureSetting(key, defaultValue) {
    try {
      return this.settings.getSecure(key, defaultValue);
    } catch (error) {
      console.error('Error getting secure setting:', error);
      throw error;
    }
  }

  async setSecureSetting(key, value) {
    try {
      this.settings.setSecure(key, value);
      return { success: true };
    } catch (error) {
      console.error('Error setting secure value:', error);
      throw error;
    }
  }

  async getUISettings() {
    try {
      return this.settings.getUISettings();
    } catch (error) {
      console.error('Error getting UI settings:', error);
      throw error;
    }
  }

  async setUISettings(uiSettings) {
    try {
      this.settings.setUISettings(uiSettings);
      return { success: true };
    } catch (error) {
      console.error('Error setting UI settings:', error);
      throw error;
    }
  }

  async getNotificationSettings() {
    try {
      return this.settings.getNotificationSettings();
    } catch (error) {
      console.error('Error getting notification settings:', error);
      throw error;
    }
  }

  async setNotificationSettings(notificationSettings) {
    try {
      this.settings.setNotificationSettings(notificationSettings);
      return { success: true };
    } catch (error) {
      console.error('Error setting notification settings:', error);
      throw error;
    }
  }

  async getSyncSettings() {
    try {
      return this.settings.getSyncSettings();
    } catch (error) {
      console.error('Error getting sync settings:', error);
      throw error;
    }
  }

  async setSyncSettings(syncSettings) {
    try {
      this.settings.setSyncSettings(syncSettings);
      return { success: true };
    } catch (error) {
      console.error('Error setting sync settings:', error);
      throw error;
    }
  }

  async getFeatureSettings() {
    try {
      return this.settings.getFeatureSettings();
    } catch (error) {
      console.error('Error getting feature settings:', error);
      throw error;
    }
  }

  async setFeatureSettings(featureSettings) {
    try {
      this.settings.setFeatureSettings(featureSettings);
      return { success: true };
    } catch (error) {
      console.error('Error setting feature settings:', error);
      throw error;
    }
  }

  async getAISettings() {
    try {
      return this.settings.getAISettings();
    } catch (error) {
      console.error('Error getting AI settings:', error);
      throw error;
    }
  }

  async setAISettings(aiSettings) {
    try {
      this.settings.setAISettings(aiSettings);
      return { success: true };
    } catch (error) {
      console.error('Error setting AI settings:', error);
      throw error;
    }
  }

  async getUserPreferences() {
    try {
      return this.settings.getUserPreferences();
    } catch (error) {
      console.error('Error getting user preferences:', error);
      throw error;
    }
  }

  async setUserPreferences(preferences) {
    try {
      this.settings.setUserPreferences(preferences);
      return { success: true };
    } catch (error) {
      console.error('Error setting user preferences:', error);
      throw error;
    }
  }

  async getAppInfo() {
    try {
      return this.settings.getAppInfo();
    } catch (error) {
      console.error('Error getting app info:', error);
      throw error;
    }
  }

  // ==================== 备份与恢复API ====================

  async exportData() {
    try {
      return {
        tasks: this.db.getAllTasks(),
        categories: this.db.getAllCategories(),
        settings: this.settings.exportSettings(),
        exportedAt: Date.now(),
        version: '1.0',
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  async importData(data) {
    try {
      // 导入设置
      if (data.settings) {
        this.settings.importSettings(data.settings);
      }

      // 导入分类
      if (data.categories && Array.isArray(data.categories)) {
        for (const category of data.categories) {
          try {
            this.db.createCategory(category);
          } catch (error) {
            // 忽略已存在的分类
            console.warn('Category already exists:', category.id);
          }
        }
      }

      // 导入任务
      if (data.tasks && Array.isArray(data.tasks)) {
        for (const task of data.tasks) {
          try {
            this.db.createTask(task);
          } catch (error) {
            // 如果任务已存在，尝试更新
            console.warn('Task import conflict:', task.id);
          }
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }

  async resetAll() {
    try {
      // 注意：这会清除所有数据！
      this.settings.reset();
      // 数据库需要手动清理或重建
      return { success: true };
    } catch (error) {
      console.error('Error resetting data:', error);
      throw error;
    }
  }

  // ==================== 同步日志API ====================

  async logSync(syncType, status, itemsSynced, errorMessage) {
    try {
      this.db.logSync(syncType, status, itemsSynced, errorMessage);
      return { success: true };
    } catch (error) {
      console.error('Error logging sync:', error);
      throw error;
    }
  }

  // ==================== 清理与维护 ====================

  close() {
    try {
      this.db.close();
    } catch (error) {
      console.error('Error closing storage:', error);
    }
  }

  getStorageInfo() {
    try {
      return {
        database: {
          stats: this.db.getStats(),
        },
        settings: {
          paths: this.settings.getStorePath(),
        },
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      throw error;
    }
  }
}

module.exports = StorageService;

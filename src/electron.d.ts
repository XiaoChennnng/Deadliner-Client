/**
 * Electron存储API的TypeScript类型定义
 */

import { Task, Category } from '../types';

export interface ElectronAPI {
  getAppVersion: () => Promise<string>;
  platform: string;
  storage: StorageAPI;
}

export interface StorageAPI {
  // 任务相关
  getTasks: () => Promise<Task[]>;
  getTask: (id: string) => Promise<Task | null>;
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean }>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<{ success: boolean }>;
  deleteTask: (id: string) => Promise<{ success: boolean }>;
  archiveTask: (id: string) => Promise<{ success: boolean }>;
  unarchiveTask: (id: string) => Promise<{ success: boolean }>;
  batchUpdateTasks: (ids: string[], updates: Partial<Task>) => Promise<{ success: boolean }>;

  // 分类相关
  getCategories: () => Promise<Category[]>;
  createCategory: (category: Omit<Category, 'id'>) => Promise<{ success: boolean }>;

  // 习惯打卡
  createHabitCheckin: (checkin: any) => Promise<{ success: boolean }>;
  getHabitCheckins: (taskId: string, startDate: Date, endDate: Date) => Promise<any[]>;

  // 统计数据
  getStats: () => Promise<{
    totalTasks: number;
    completedTasks: number;
    archivedTasks: number;
    habits: number;
    categories: number;
  }>;

  // 设置相关
  getSetting: (key: string, defaultValue?: any) => Promise<any>;
  setSetting: (key: string, value: any) => Promise<{ success: boolean }>;
  getSecureSetting: (key: string, defaultValue?: any) => Promise<any>;
  setSecureSetting: (key: string, value: any) => Promise<{ success: boolean }>;

  // 具体设置项
  getUISettings: () => Promise<UISettings>;
  setUISettings: (settings: Partial<UISettings>) => Promise<{ success: boolean }>;
  getNotificationSettings: () => Promise<NotificationSettings>;
  setNotificationSettings: (settings: Partial<NotificationSettings>) => Promise<{ success: boolean }>;
  getSyncSettings: () => Promise<SyncSettings>;
  setSyncSettings: (settings: Partial<SyncSettings>) => Promise<{ success: boolean }>;
  getFeatureSettings: () => Promise<FeatureSettings>;
  setFeatureSettings: (settings: Partial<FeatureSettings>) => Promise<{ success: boolean }>;
  getAISettings: () => Promise<AISettings>;
  setAISettings: (settings: Partial<AISettings>) => Promise<{ success: boolean }>;
  getUserPreferences: () => Promise<UserPreferences>;
  setUserPreferences: (preferences: Partial<UserPreferences>) => Promise<{ success: boolean }>;
  getAppInfo: () => Promise<AppInfo>;

  // 备份与恢复
  exportData: () => Promise<ExportData>;
  importData: (data: ExportData) => Promise<{ success: boolean }>;
  getStorageInfo: () => Promise<StorageInfo>;

  // WebDAV同步
  webdavTestConnection: () => Promise<{ success: boolean; error?: string }>;
  webdavUploadBackup: () => Promise<{ success: boolean; remotePath?: string; error?: string }>;
  webdavDownloadBackup: () => Promise<{ success: boolean; error?: string }>;
  webdavDownloadSnapshot: () => Promise<{ success: boolean; error?: string }>;
}

export interface UISettings {
  progressDirection: 'horizontal' | 'vertical';
  enableAnimations: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: 'zh-CN' | 'en-US';
  fontSize: 'small' | 'medium' | 'large';
  sidebarCollapsed: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  deadlineReminder: boolean;
  dailyStats: boolean;
  weeklyReport: boolean;
  sound: boolean;
  vibration: boolean;
  reminderAdvance: number;
}

export interface SyncSettings {
  enabled: boolean;
  provider: 'webdav' | 'local' | 'cloud';
  autoSync: boolean;
  syncInterval: number;
  lastSyncTime: number | null;
  webdav: {
    url: string;
    username: string;
    password?: string;
  };
}

export interface FeatureSettings {
  autoArchive: boolean;
  autoArchiveDays: number;
  aiEnabled: boolean;
  aiProvider: 'openai' | 'claude' | 'local';
  habitTracking: boolean;
  statistics: boolean;
  backup: boolean;
  autoBackupInterval: number;
}

export interface AISettings {
  enabled: boolean;
  provider: 'openai' | 'claude' | 'local';
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface UserPreferences {
  startPage: string;
  taskSortBy: 'deadline' | 'created' | 'updated' | 'priority';
  defaultTaskType: 'task' | 'habit';
  defaultPriority: 'low' | 'medium' | 'high';
  defaultCategory: string;
  confirmDelete: boolean;
  confirmComplete: boolean;
}

export interface AppInfo {
  version: string;
  firstRun: boolean;
  installDate: number;
  launchCount: number;
  lastLaunchTime: number | null;
}

export interface ExportData {
  tasks: Task[];
  categories: Category[];
  settings: any;
  exportedAt: number;
  version: string;
}

export interface StorageInfo {
  database: {
    stats: {
      totalTasks: number;
      completedTasks: number;
      archivedTasks: number;
      habits: number;
      categories: number;
    };
  };
  settings: {
    paths: {
      settings: string;
      secure: string;
    };
  };
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

import { useState, useEffect, useCallback } from 'react';
import { Task, Category } from '../types';
import { UISettings, NotificationSettings, FeatureSettings, AISettings, UserPreferences } from '../electron';

/**
 * 检查是否在Electron环境中运行（严格返回布尔）
 */
const isElectronEnv = (): boolean => {
  // 强制布尔化，避免返回对象导致类型不匹配
  return !!(typeof window !== 'undefined' && (window as any).electron && (window as any).electron.storage);
};

/**
 * useElectronStorage - React Hook for Electron storage
 *
 * 提供统一的存储接口，自动处理Electron和Web环境
 */
export const useElectronStorage = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(isElectronEnv());
  }, []);

  return {
    isReady,
    isElectron: isElectronEnv(),
    storage: isElectronEnv() ? window.electron.storage : null,
  };
};

/**
 * useTasks - 任务数据管理Hook
 */
export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isElectron: inElectron, storage } = useElectronStorage();

  const loadTasks = useCallback(async () => {
    if (!inElectron || !storage) return;

    try {
      setLoading(true);
      const data = await storage.getTasks();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [inElectron, storage]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const createTask = useCallback(async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!storage) return;

    try {
      await storage.createTask(task);
      await loadTasks();
    } catch (err) {
      console.error('Error creating task:', err);
      throw err;
    }
  }, [storage, loadTasks]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    if (!storage) return;

    try {
      await storage.updateTask(id, updates);
      await loadTasks();
    } catch (err) {
      console.error('Error updating task:', err);
      throw err;
    }
  }, [storage, loadTasks]);

  const deleteTask = useCallback(async (id: string) => {
    if (!storage) return;

    try {
      await storage.deleteTask(id);
      await loadTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
      throw err;
    }
  }, [storage, loadTasks]);

  const archiveTask = useCallback(async (id: string) => {
    if (!storage) return;

    try {
      await storage.archiveTask(id);
      await loadTasks();
    } catch (err) {
      console.error('Error archiving task:', err);
      throw err;
    }
  }, [storage, loadTasks]);

  const unarchiveTask = useCallback(async (id: string) => {
    if (!storage) return;

    try {
      await storage.unarchiveTask(id);
      await loadTasks();
    } catch (err) {
      console.error('Error unarchiving task:', err);
      throw err;
    }
  }, [storage, loadTasks]);

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    archiveTask,
    unarchiveTask,
    reload: loadTasks,
  };
};

/**
 * useCategories - 分类数据管理Hook
 */
export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { isElectron: inElectron, storage } = useElectronStorage();

  const loadCategories = useCallback(async () => {
    if (!inElectron || !storage) return;

    try {
      setLoading(true);
      const data = await storage.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  }, [inElectron, storage]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const createCategory = useCallback(async (category: Omit<Category, 'id'>) => {
    if (!storage) return;

    try {
      await storage.createCategory(category);
      await loadCategories();
    } catch (err) {
      console.error('Error creating category:', err);
      throw err;
    }
  }, [storage, loadCategories]);

  return {
    categories,
    loading,
    createCategory,
    reload: loadCategories,
  };
};

/**
 * useSettings - 设置管理Hook
 */
export function useSettings<T = any>(
  settingsType: 'ui' | 'notification' | 'feature' | 'ai' | 'preferences' | 'sync'
) {
  const [settings, setSettings] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const { isElectron: inElectron, storage } = useElectronStorage();

  const loadSettings = useCallback(async () => {
    if (!inElectron || !storage) return;

    try {
      setLoading(true);
      let data;
      switch (settingsType) {
        case 'ui':
          data = await storage.getUISettings();
          break;
        case 'notification':
          data = await storage.getNotificationSettings();
          break;
        case 'feature':
          data = await storage.getFeatureSettings();
          break;
        case 'ai':
          data = await storage.getAISettings();
          break;
        case 'sync':
          data = await storage.getSyncSettings();
          break;
        case 'preferences':
          data = await storage.getUserPreferences();
          break;
      }
      setSettings(data as T);
    } catch (err) {
      console.error(`Error loading ${settingsType} settings:`, err);
    } finally {
      setLoading(false);
    }
  }, [inElectron, storage, settingsType]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSettings = useCallback(async (updates: Partial<T>) => {
    if (!storage) return;

    try {
      switch (settingsType) {
        case 'ui':
          await storage.setUISettings(updates as Partial<UISettings>);
          break;
        case 'notification':
          await storage.setNotificationSettings(updates as Partial<NotificationSettings>);
          break;
        case 'feature':
          await storage.setFeatureSettings(updates as Partial<FeatureSettings>);
          break;
        case 'ai':
          await storage.setAISettings(updates as Partial<AISettings>);
          break;
        case 'sync':
          await storage.setSyncSettings(updates as any);
          break;
        case 'preferences':
          await storage.setUserPreferences(updates as Partial<UserPreferences>);
          break;
      }
      await loadSettings();
    } catch (err) {
      console.error(`Error updating ${settingsType} settings:`, err);
      throw err;
    }
  }, [storage, settingsType, loadSettings]);

  return {
    settings,
    loading,
    updateSettings,
    reload: loadSettings,
  };
}

/**
 * useStats - 统计数据Hook
 */
export const useStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isElectron: inElectron, storage } = useElectronStorage();

  const loadStats = useCallback(async () => {
    if (!inElectron || !storage) return;

    try {
      setLoading(true);
      const data = await storage.getStats();
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  }, [inElectron, storage]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    reload: loadStats,
  };
};

/**
 * useBackup - 备份与恢复Hook
 */
export const useBackup = () => {
  const { isElectron: inElectron, storage } = useElectronStorage();

  const exportData = useCallback(async () => {
    if (!storage) return null;

    try {
      return await storage.exportData();
    } catch (err) {
      console.error('Error exporting data:', err);
      throw err;
    }
  }, [storage]);

  const importData = useCallback(async (data: any) => {
    if (!storage) return;

    try {
      await storage.importData(data);
    } catch (err) {
      console.error('Error importing data:', err);
      throw err;
    }
  }, [storage]);

  return {
    isElectron: inElectron,
    exportData,
    importData,
  };
};

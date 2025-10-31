import { triggerAutoBackup } from './utils/autoBackup';

// 包装渲染器暴露的存储方法，在写入操作后触发WebDAV备份
export function initAutoBackupWrappers() {
  const s: any = (window as any)?.electron?.storage;
  if (!s) return;
  if (s.__autoBackupWrapped) return; // 避免重复包装

  const wrap = (methodName: string) => {
    const orig = s[methodName];
    if (typeof orig !== 'function') return;
    s[methodName] = async (...args: any[]) => {
      const result = await orig.apply(s, args);
      // 在成功写入后触发防抖备份
      try { triggerAutoBackup(methodName); } catch {}
      return result;
    };
  };

  // 被视为写入操作的方法
  [
    'createTask', 'updateTask', 'deleteTask', 'archiveTask', 'unarchiveTask', 'batchUpdateTasks',
    'createCategory',
    'createHabitCheckin',
    'setSetting', 'setSecureSetting', 'setUISettings', 'setNotificationSettings', 'setSyncSettings',
    'setFeatureSettings', 'setAISettings', 'setUserPreferences',
    'importData', 'importSnapshot'
  ].forEach(wrap);

  s.__autoBackupWrapped = true;
}

// 模块导入时尽力初始化
try { initAutoBackupWrappers(); } catch {}
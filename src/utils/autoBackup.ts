// 数据库写入操作后触发的防抖自动备份上传器
let timer: any = null;
const DEBOUNCE_MS = 3000;

export async function triggerAutoBackup(reason: string = 'change') {
  try {
    const sync = await (window as any).electron.storage.getSyncSettings();
    // 仅在WebDAV同步已启用且自动同步未禁用时运行
    const enabled = !!(sync && sync.enabled && sync.provider === 'webdav' && (sync.autoSync !== false));
    if (!enabled) return;
  } catch (_) {
    // 如果无法读取设置，则跳过
    return;
  }

  if (timer) clearTimeout(timer);
  timer = setTimeout(async () => {
    try {
      const res = await (window as any).electron.storage.webdavUploadBackup();
      if (!(res && res.success)) {
        console.warn('[auto-backup] failed:', (res && res.error) || 'unknown error');
      } else {
        console.log('[auto-backup] success', reason);
      }
    } catch (err: any) {
      console.warn('[auto-backup] exception:', err?.message || String(err));
    }
  }, DEBOUNCE_MS);
}
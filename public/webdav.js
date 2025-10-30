const { createClient } = require('webdav');

/**
 * WebDAVSync - 简单的 WebDAV 同步助手
 * 仅提供备份上传/下载与连接测试，不影响现有本地数据逻辑
 */
class WebDAVSync {
  static createClientFromConfig(config) {
    const { url, username, password } = config || {};
    if (!url || !username || !password) {
      throw new Error('WebDAV 配置不完整：请填写 URL、用户名与密码');
    }
    return createClient(url, { username, password });
  }

  /**
   * 测试连接
   */
  static async testConnection(config) {
    const client = WebDAVSync.createClientFromConfig(config);
    try {
      // 简单尝试读取根目录内容
      await client.getDirectoryContents('/');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 上传备份 JSON 到远端路径
   * 默认路径：/Deadliner/backup.json
   */
  static async uploadBackup(config, data) {
    const client = WebDAVSync.createClientFromConfig(config);
    const folder = '/Deadliner';
    const remotePath = `${folder}/backup.json`;

    try {
      // 确保目录存在
      try {
        await client.stat(folder);
      } catch (_) {
        await client.createDirectory(folder);
      }

      const content = JSON.stringify(data, null, 2);
      await client.putFileContents(remotePath, content, {
        overwrite: true,
        contentType: 'application/json',
      });
      return { success: true, remotePath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 从远端下载备份并返回 JSON 数据
   * 默认路径：/Deadliner/backup.json
   */
  static async downloadBackup(config) {
    const client = WebDAVSync.createClientFromConfig(config);
    const remotePath = '/Deadliner/backup.json';
    try {
      const content = await client.getFileContents(remotePath, 'text');
      const json = JSON.parse(content);
      return { success: true, data: json };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 上传移动端快照（snapshot-v1.json）到远端
   * 路径：/Deadliner/snapshot-v1.json
   */
  static async uploadSnapshot(config, snapshot) {
    const client = WebDAVSync.createClientFromConfig(config);
    const folder = '/Deadliner';
    const remotePath = `${folder}/snapshot-v1.json`;

    try {
      // 确保目录存在
      try {
        await client.stat(folder);
      } catch (_) {
        await client.createDirectory(folder);
      }

      const content = JSON.stringify(snapshot, null, 2);
      await client.putFileContents(remotePath, content, {
        overwrite: true,
        contentType: 'application/json',
      });
      return { success: true, remotePath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 下载移动端快照（snapshot-v1.json）
   */
  static async downloadSnapshot(config) {
    const client = WebDAVSync.createClientFromConfig(config);
    const remotePath = '/Deadliner/snapshot-v1.json';
    try {
      const content = await client.getFileContents(remotePath, 'text');
      const json = JSON.parse(content);
      return { success: true, data: json };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = WebDAVSync;
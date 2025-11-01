const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

/**
 * DatabaseHelper - SQLite数据库管理类
 * 参考Android端的数据库设计，使用单例模式
 */
class DatabaseHelper {
  constructor() {
    if (DatabaseHelper.instance) {
      return DatabaseHelper.instance;
    }

    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'deadliner.db');

    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL'); // 预写日志模式，提升性能

    this.initDatabase();
    DatabaseHelper.instance = this;
  }

  /**
   * 初始化数据库表结构
   */
  initDatabase() {
    // 任务表 - 参考Android端的ddl_items表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL CHECK(type IN ('task', 'habit')),
        priority TEXT NOT NULL CHECK(priority IN ('low', 'medium', 'high')),
        category TEXT NOT NULL,
        deadline INTEGER,
        completed INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        tags TEXT,
        progress INTEGER,
        streak INTEGER,
        is_starred INTEGER NOT NULL DEFAULT 0,
        is_archived INTEGER NOT NULL DEFAULT 0,
        is_deleted INTEGER NOT NULL DEFAULT 0,
        version INTEGER NOT NULL DEFAULT 1,
        sync_status TEXT DEFAULT 'pending' CHECK(sync_status IN ('pending', 'synced', 'conflict')),
        last_sync_at INTEGER
      )
    `);

    // 分类表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        icon TEXT,
        created_at INTEGER NOT NULL,
        is_deleted INTEGER NOT NULL DEFAULT 0
      )
    `);

    // 习惯打卡记录表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS habit_checkins (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        checkin_date INTEGER NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        notes TEXT,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
      )
    `);

    // 同步日志表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sync_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sync_type TEXT NOT NULL,
        sync_status TEXT NOT NULL,
        sync_time INTEGER NOT NULL,
        error_message TEXT,
        items_synced INTEGER DEFAULT 0
      )
    `);

    // 创建索引以提高查询性能
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_tasks_type ON tasks(type);
      CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
      CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);
      CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
      CREATE INDEX IF NOT EXISTS idx_tasks_archived ON tasks(is_archived);
      CREATE INDEX IF NOT EXISTS idx_tasks_deleted ON tasks(is_deleted);
      CREATE INDEX IF NOT EXISTS idx_habit_checkins_task_id ON habit_checkins(task_id);
      CREATE INDEX IF NOT EXISTS idx_habit_checkins_date ON habit_checkins(checkin_date);
    `);

    // 不再自动初始化默认分类
    // this.initDefaultCategories();
  }

  /**
   * 初始化默认分类（已禁用）
   */
  initDefaultCategories() {
    // 已禁用 - 不再自动创建默认分类
    /*
    const defaultCategories = [
      { id: 'work', name: '工作', color: '#3B82F6', icon: 'briefcase' },
      { id: 'personal', name: '个人', color: '#8B5CF6', icon: 'user' },
      { id: 'health', name: '健康', color: '#10B981', icon: 'heart' },
      { id: 'learning', name: '学习', color: '#F59E0B', icon: 'book' },
      { id: 'family', name: '家庭', color: '#EF4444', icon: 'home' },
    ];

    const insertCategory = this.db.prepare(`
      INSERT OR IGNORE INTO categories (id, name, color, icon, created_at, is_deleted)
      VALUES (?, ?, ?, ?, ?, 0)
    `);

    const now = Date.now();
    for (const category of defaultCategories) {
      insertCategory.run(category.id, category.name, category.color, category.icon, now);
    }
    */
  }

  /**
   * 清理所有任务（用于调试）
   */
  clearAllTasks() {
    console.log('[Database] Clearing all tasks');
    const stmt = this.db.prepare('DELETE FROM tasks');
    return stmt.run();
  }

  // ==================== 任务CRUD操作 ====================

  /**
   * 创建任务
   */
  createTask(task) {
    const stmt = this.db.prepare(`
      INSERT INTO tasks (
        id, title, description, type, priority, category, deadline,
        completed, created_at, updated_at, tags, progress, streak,
        is_starred, is_archived, is_deleted, version, sync_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = Date.now();
    const tags = Array.isArray(task.tags) ? JSON.stringify(task.tags) : '[]';

    const result = stmt.run(
      task.id,
      task.title,
      task.description || null,
      task.type,
      task.priority,
      task.category,
      task.deadline ? new Date(task.deadline).getTime() : null,
      task.completed ? 1 : 0,
      task.createdAt ? new Date(task.createdAt).getTime() : now,
      task.updatedAt ? new Date(task.updatedAt).getTime() : now,
      tags,
      task.progress || null,
      task.streak || null,
      task.isStarred ? 1 : 0,
      task.isArchived ? 1 : 0,
      0, // is_deleted
      1, // version
      'pending' // sync_status
    );

    return result;
  }

  /**
   * 获取所有未删除的任务
   */
  getAllTasks() {
    const stmt = this.db.prepare(`
      SELECT * FROM tasks WHERE is_deleted = 0 ORDER BY created_at DESC
    `);

    const tasks = stmt.all();
    const mappedTasks = tasks.map(task => this.mapTaskFromDB(task));
    return mappedTasks;
  }

  /**
   * 根据ID获取任务
   */
  getTaskById(id) {
    const stmt = this.db.prepare(`
      SELECT * FROM tasks WHERE id = ? AND is_deleted = 0
    `);

    const task = stmt.get(id);
    return task ? this.mapTaskFromDB(task) : null;
  }

  /**
   * 更新任务
   */
  updateTask(id, updates) {
    const fields = [];
    const values = [];

    // 动态构建更新字段
    const allowedFields = [
      'title', 'description', 'type', 'priority', 'category',
      'deadline', 'completed', 'tags', 'progress', 'streak',
      'is_starred', 'is_archived'
    ];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        let dbField = field;
        let value = updates[field];

        // 处理字段名映射
        if (field === 'isStarred') dbField = 'is_starred';
        if (field === 'isArchived') dbField = 'is_archived';

        // 处理特殊类型
        if (field === 'deadline' && value) {
          value = new Date(value).getTime();
        } else if (field === 'completed' || field === 'is_starred' || field === 'is_archived') {
          value = value ? 1 : 0;
        } else if (field === 'tags') {
          value = JSON.stringify(value);
        }

        fields.push(`${dbField} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) return;

    // 更新updated_at和version
    fields.push('updated_at = ?', 'version = version + 1', 'sync_status = ?');
    values.push(Date.now(), 'pending');

    const sql = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);

    const stmt = this.db.prepare(sql);
    return stmt.run(...values);
  }

  /**
   * 软删除任务
   */
  deleteTask(id) {
    const stmt = this.db.prepare(`
      UPDATE tasks
      SET is_deleted = 1, updated_at = ?, version = version + 1, sync_status = ?
      WHERE id = ?
    `);
    const result = stmt.run(Date.now(), 'pending', id);
    return result;
  }

  /**
   * 归档任务
   */
  archiveTask(id) {
    const stmt = this.db.prepare(`
      UPDATE tasks
      SET is_archived = 1, updated_at = ?, version = version + 1, sync_status = ?
      WHERE id = ?
    `);
    return stmt.run(Date.now(), 'pending', id);
  }

  /**
   * 取消归档
   */
  unarchiveTask(id) {
    const stmt = this.db.prepare(`
      UPDATE tasks
      SET is_archived = 0, updated_at = ?, version = version + 1, sync_status = ?
      WHERE id = ?
    `);
    return stmt.run(Date.now(), 'pending', id);
  }

  /**
   * 批量操作
   */
  batchUpdateTasks(ids, updates) {
    const transaction = this.db.transaction((taskIds, taskUpdates) => {
      for (const id of taskIds) {
        this.updateTask(id, taskUpdates);
      }
    });

    return transaction(ids, updates);
  }

  // ==================== 分类CRUD操作 ====================

  getAllCategories() {
    const stmt = this.db.prepare(`
      SELECT * FROM categories WHERE is_deleted = 0 ORDER BY created_at ASC
    `);

    return stmt.all().map(cat => ({
      id: cat.id,
      name: cat.name,
      color: cat.color,
      icon: cat.icon
    }));
  }

  createCategory(category) {
    const stmt = this.db.prepare(`
      INSERT INTO categories (id, name, color, icon, created_at, is_deleted)
      VALUES (?, ?, ?, ?, ?, 0)
    `);

    return stmt.run(
      category.id,
      category.name,
      category.color,
      category.icon || null,
      Date.now()
    );
  }

  // ==================== 习惯打卡操作 ====================

  createHabitCheckin(checkin) {
    const stmt = this.db.prepare(`
      INSERT INTO habit_checkins (id, task_id, checkin_date, completed, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    return stmt.run(
      checkin.id,
      checkin.taskId,
      new Date(checkin.checkinDate).getTime(),
      checkin.completed ? 1 : 0,
      checkin.notes || null,
      Date.now()
    );
  }

  getHabitCheckins(taskId, startDate, endDate) {
    const stmt = this.db.prepare(`
      SELECT * FROM habit_checkins
      WHERE task_id = ? AND checkin_date BETWEEN ? AND ?
      ORDER BY checkin_date DESC
    `);

    return stmt.all(
      taskId,
      new Date(startDate).getTime(),
      new Date(endDate).getTime()
    );
  }

  // ==================== 同步日志 ====================

  logSync(syncType, status, itemsSynced, errorMessage = null) {
    const stmt = this.db.prepare(`
      INSERT INTO sync_logs (sync_type, sync_status, sync_time, error_message, items_synced)
      VALUES (?, ?, ?, ?, ?)
    `);

    return stmt.run(syncType, status, Date.now(), errorMessage, itemsSynced);
  }

  // ==================== 工具方法 ====================

  /**
   * 将数据库记录映射为前端任务对象
   */
  mapTaskFromDB(dbTask) {
    return {
      id: dbTask.id,
      title: dbTask.title,
      description: dbTask.description,
      type: dbTask.type,
      priority: dbTask.priority,
      category: dbTask.category,
      deadline: dbTask.deadline ? new Date(dbTask.deadline) : undefined,
      completed: dbTask.completed === 1,
      createdAt: new Date(dbTask.created_at),
      updatedAt: new Date(dbTask.updated_at),
      tags: dbTask.tags ? JSON.parse(dbTask.tags) : [],
      progress: dbTask.progress,
      streak: dbTask.streak,
      isStarred: dbTask.is_starred === 1,
      isArchived: dbTask.is_archived === 1,
    };
  }

  /**
   * 关闭数据库连接
   */
  close() {
    this.db.close();
  }

  /**
   * 获取数据库统计信息
   */
  getStats() {
    const stats = {};

    stats.totalTasks = this.db.prepare('SELECT COUNT(*) as count FROM tasks WHERE is_deleted = 0').get().count;
    stats.completedTasks = this.db.prepare('SELECT COUNT(*) as count FROM tasks WHERE completed = 1 AND is_deleted = 0').get().count;
    stats.archivedTasks = this.db.prepare('SELECT COUNT(*) as count FROM tasks WHERE is_archived = 1 AND is_deleted = 0').get().count;
    stats.habits = this.db.prepare('SELECT COUNT(*) as count FROM tasks WHERE type = "habit" AND is_deleted = 0').get().count;
    stats.categories = this.db.prepare('SELECT COUNT(*) as count FROM categories WHERE is_deleted = 0').get().count;

    return stats;
  }
}

module.exports = DatabaseHelper;

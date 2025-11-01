// 撤销管理器
export interface UndoAction {
  id: string;
  type: 'delete_task' | 'delete_category' | 'batch_delete';
  data: any;
  timestamp: number;
  description: string;
}

class UndoManager {
  private static instance: UndoManager;
  private actions: UndoAction[] = [];
  private readonly MAX_ACTIONS = 10; // 最多保存10个撤销操作
  private readonly EXPIRY_TIME = 5 * 60 * 1000; // 5分钟过期

  static getInstance(): UndoManager {
    if (!UndoManager.instance) {
      UndoManager.instance = new UndoManager();
    }
    return UndoManager.instance;
  }

  // 添加撤销操作
  addAction(action: Omit<UndoAction, 'id' | 'timestamp'>): string {
    const id = `undo_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const fullAction: UndoAction = {
      ...action,
      id,
      timestamp: Date.now(),
    };

    this.actions.unshift(fullAction);

    // 限制数量
    if (this.actions.length > this.MAX_ACTIONS) {
      this.actions = this.actions.slice(0, this.MAX_ACTIONS);
    }

    // 清理过期操作
    this.cleanup();

    return id;
  }

  // 执行撤销
  undo(actionId: string): UndoAction | null {
    const index = this.actions.findIndex(action => action.id === actionId);
    if (index === -1) return null;

    const action = this.actions[index];
    this.actions.splice(index, 1);

    return action;
  }

  // 获取可撤销的操作
  getAvailableActions(): UndoAction[] {
    this.cleanup();
    return this.actions.filter(action =>
      Date.now() - action.timestamp < this.EXPIRY_TIME
    );
  }

  // 清理过期操作
  private cleanup(): void {
    const now = Date.now();
    this.actions = this.actions.filter(action =>
      now - action.timestamp < this.EXPIRY_TIME
    );
  }

  // 清空所有操作
  clear(): void {
    this.actions = [];
  }
}

export const undoManager = UndoManager.getInstance();
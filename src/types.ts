/**
 * Deadliner 应用程序的核心类型定义
 * 定义了任务、分类、用户等数据结构
 */

// 任务接口 - 表示单个任务或习惯
export interface Task {
  id: string; // 唯一标识符
  title: string; // 任务标题
  description?: string; // 任务描述（可选）
  type: 'task' | 'habit'; // 任务类型：普通任务或习惯
  priority: 'low' | 'medium' | 'high'; // 优先级
  category: string; // 所属分类ID
  deadline?: Date; // 截止时间（可选）
  completed: boolean; // 是否已完成
  createdAt: Date; // 创建时间
  updatedAt: Date; // 最后更新时间
  tags: string[]; // 标签数组
  progress?: number; // 进度百分比（用于习惯）
  streak?: number; // 连续完成天数（用于习惯）
  isStarred: boolean; // 是否标星
  isArchived: boolean; // 是否已归档
}

// 分类接口 - 任务分类信息
export interface Category {
  id: string; // 唯一标识符
  name: string; // 分类名称
  color: string; // 分类颜色（十六进制）
  icon?: string; // 分类图标（可选）
}

// 用户接口 - 用户信息
export interface User {
  id: string; // 用户ID
  name: string; // 用户名
  email: string; // 邮箱
  avatar?: string; // 头像URL（可选）
  preferences: UserPreferences; // 用户偏好设置
}

// 用户偏好设置接口
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'; // 主题设置
  language: 'zh-CN' | 'en-US'; // 语言设置
  notifications: NotificationSettings; // 通知设置
  ai: AISettings; // AI 设置
}

// 通知设置接口
export interface NotificationSettings {
  enabled: boolean; // 是否启用通知
  deadline: boolean; // 截止时间提醒
  daily: boolean; // 每日提醒
  weekly: boolean; // 每周提醒
  sound: boolean; // 声音提醒
  vibration: boolean; // 震动提醒
}

// AI 设置接口
export interface AISettings {
  enabled: boolean; // 是否启用AI功能
  provider: 'openai' | 'claude' | 'local'; // AI提供商
  apiKey?: string; // API密钥（可选）
  model: string; // 使用的模型
  temperature: number; // 生成温度参数
  maxTokens: number; // 最大token数
}

// 应用程序状态接口 - 全局状态管理
export interface AppState {
  user: User | null; // 当前用户信息
  tasks: Task[]; // 所有任务列表
  categories: Category[]; // 所有分类列表
  currentView: 'overview' | 'tasks' | 'habits' | 'archive'; // 当前视图
  currentFilter: 'all' | 'tasks' | 'habits'; // 当前过滤器
  selectedCategory: string | null; // 选中的分类ID
  sortBy: 'deadline' | 'created' | 'updated' | 'priority'; // 排序方式
  searchQuery: string; // 搜索关键词
  isMultiSelectMode: boolean; // 是否处于多选模式
  selectedTasks: Set<string>; // 选中的任务ID集合
  sidebarCollapsed: boolean; // 侧边栏是否折叠
  loading: boolean; // 是否正在加载
  error: string | null; // 错误信息
}
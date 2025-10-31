// Deadliner应用程序的类型定义
export interface Task {
  id: string;
  title: string;
  description?: string;
  type: 'task' | 'habit';
  priority: 'low' | 'medium' | 'high';
  category: string;
  deadline?: Date;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  progress?: number; // 用于习惯
  streak?: number; // 用于习惯
  isStarred: boolean;
  isArchived: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'zh-CN' | 'en-US';
  notifications: NotificationSettings;
  ai: AISettings;
}

export interface NotificationSettings {
  enabled: boolean;
  deadline: boolean;
  daily: boolean;
  weekly: boolean;
  sound: boolean;
  vibration: boolean;
}

export interface AISettings {
  enabled: boolean;
  provider: 'openai' | 'claude' | 'local';
  apiKey?: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface AppState {
  user: User | null;
  tasks: Task[];
  categories: Category[];
  currentView: 'overview' | 'tasks' | 'habits' | 'archive';
  currentFilter: 'all' | 'tasks' | 'habits';
  selectedCategory: string | null;
  sortBy: 'deadline' | 'created' | 'updated' | 'priority';
  searchQuery: string;
  isMultiSelectMode: boolean;
  selectedTasks: Set<string>;
  sidebarCollapsed: boolean;
  loading: boolean;
  error: string | null;
}
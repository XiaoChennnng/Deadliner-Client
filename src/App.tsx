/**
 * Deadliner 主应用程序组件
 * 负责整体布局、主题管理和页面路由
 */

import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Box,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';
import { AppProvider } from './context/AppContext';
import { createAppTheme, themePalettes } from './theme/themes';
import { Sidebar } from './components/Sidebar';
import { TaskList } from './components/TaskListMUI';
import { TaskForm } from './components/TaskForm';
import { Task } from './types';

// 懒加载页面组件以优化启动性能
const OverviewPage = lazy(() => import('./components/OverviewPage').then(module => ({ default: module.OverviewPage })));
const HabitsPage = lazy(() => import('./components/HabitsPage').then(module => ({ default: module.HabitsPage })));
const ArchivePage = lazy(() => import('./components/ArchivePage').then(module => ({ default: module.ArchivePage })));
const AIGenerationPage = lazy(() => import('./components/AIGenerationPage').then(module => ({ default: module.AIGenerationPage })));
const SettingsPage = lazy(() => import('./components/SettingsPage').then(module => ({ default: module.SettingsPage })));

/**
 * 仪表板组件 - 显示任务列表和任务表单
 * @param onEditTask 编辑任务的回调函数
 */
const Dashboard: React.FC<{ onEditTask: (task: Task) => void }> = ({ onEditTask }) => {
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);

  return (
    <Box sx={{ flex: 1, overflow: 'hidden' }}>
      {/* 任务列表组件 */}
      <TaskList onAddTask={() => setIsTaskFormOpen(true)} onEditTask={onEditTask} />
      {/* 任务创建/编辑表单 */}
      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={() => setIsTaskFormOpen(false)}
        defaultType="task"
      />
    </Box>
  );
};

const PlaceholderPage: React.FC<{ title: string; icon: string }> = ({ title, icon }) => (
  <Box
    sx={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      p: 6,
    }}
  >
    <Box>
      <Box sx={{ fontSize: '6rem', mb: 4 }}>{icon}</Box>
      <Box sx={{ typography: 'h4', fontWeight: 700, mb: 2 }}>{title}</Box>
      <Box sx={{ typography: 'body1', color: 'text.secondary' }}>
        此功能正在开发中,敬请期待...
      </Box>
    </Box>
  </Box>
);

/**
 * 主应用程序函数
 * 管理全局状态和页面导航
 */
function App() {
  // 页面状态管理
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // 主题状态管理
  const [darkMode, setDarkMode] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [themeColor, setThemeColor] = useState<keyof typeof themePalettes>('purple');

  // 检测系统主题偏好
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  // 根据系统主题自动切换深色模式
  useEffect(() => {
    setDarkMode(prefersDarkMode);
  }, [prefersDarkMode]);

  // 全局键盘快捷键处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+N: 打开新任务表单
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        setIsTaskFormOpen(true);
      }

      // Ctrl+/: 聚焦搜索框
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('input[name="search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }

      // Ctrl+Shift+A: 切换到AI生成页面
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setCurrentPage('ai-generation');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const theme = useMemo(
    () => createAppTheme(themeColor, darkMode ? 'dark' : 'light'),
    [darkMode, themeColor]
  );

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
  };

  const handleThemeColorChange = (color: keyof typeof themePalettes) => {
    setThemeColor(color);
  };

  const handleQuickAdd = () => {
    setEditingTask(null);
    setIsTaskFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  };



  const handleNavigation = (page: string) => {
    setCurrentPage(page);
    setMobileOpen(false);
  };

  /**
   * 根据当前页面渲染对应的组件
   * 使用Suspense包装懒加载组件，提供加载状态
   */
  const renderCurrentPage = () => {
    // 懒加载时的加载指示器
    const LoadingFallback = () => (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );

    // 根据当前页面返回对应的组件
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onEditTask={handleEditTask} />;
      case 'add-task':
        return <Dashboard onEditTask={handleEditTask} />;
      case 'overview':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <OverviewPage />
          </Suspense>
        );
      case 'habits':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <HabitsPage onAddHabit={handleQuickAdd} onEditHabit={handleEditTask} />
          </Suspense>
        );
      case 'archive':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ArchivePage />
          </Suspense>
        );
      case 'ai-generation':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <AIGenerationPage />
          </Suspense>
        );
      case 'settings':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <SettingsPage
              darkMode={darkMode}
              onThemeToggle={handleThemeToggle}
              themeColor={themeColor}
              onThemeColorChange={handleThemeColorChange}
            />
          </Suspense>
        );
      default:
        return <PlaceholderPage title={currentPage} icon="🔧" />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
          <Sidebar
            currentPage={currentPage}
            onNavigate={handleNavigation}
            darkMode={darkMode}
            onThemeToggle={handleThemeToggle}
            mobileOpen={mobileOpen}
            onDrawerToggle={handleDrawerToggle}
          />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              bgcolor: 'background.default',
            }}
          >
            {renderCurrentPage()}
          </Box>
          <TaskForm
            isOpen={isTaskFormOpen}
            onClose={() => {
              setIsTaskFormOpen(false);
              setEditingTask(null);
            }}
            editingTask={editingTask}
            defaultType={currentPage === 'habits' ? 'habit' : 'task'}
          />
        </Box>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;

import React, { useState, useEffect, useMemo } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Box,
  useMediaQuery,
} from '@mui/material';
import { AppProvider } from './context/AppContext';
import { createAppTheme, themePalettes } from './theme/themes';
import { Sidebar } from './components/Sidebar';
import { TaskList } from './components/TaskListMUI';
import { TaskForm } from './components/TaskForm';
import { Task } from './types';
import { OverviewPage } from './components/OverviewPage';
import { HabitsPage } from './components/HabitsPage';
import { ArchivePage } from './components/ArchivePage';
import { AIGenerationPage } from './components/AIGenerationPage';
import { SettingsPage } from './components/SettingsPage';

const Dashboard: React.FC<{ onEditTask: (task: Task) => void }> = ({ onEditTask }) => {
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);

  return (
    <Box sx={{ flex: 1, overflow: 'hidden' }}>
      <TaskList onAddTask={() => setIsTaskFormOpen(true)} onEditTask={onEditTask} />
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

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [themeColor, setThemeColor] = useState<keyof typeof themePalettes>('purple');

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  useEffect(() => {
    setDarkMode(prefersDarkMode);
  }, [prefersDarkMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        setIsTaskFormOpen(true);
      }

      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('input[name="search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }

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

  const handleAIGeneration = () => {
    setCurrentPage('ai-generation');
  };

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
    setMobileOpen(false);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onEditTask={handleEditTask} />;
      case 'add-task':
        return <Dashboard onEditTask={handleEditTask} />;
      case 'overview':
        return <OverviewPage />;
      case 'habits':
        return <HabitsPage onAddHabit={handleQuickAdd} onEditHabit={handleEditTask} />;
      case 'archive':
        return <ArchivePage />;
      case 'ai-generation':
        return <AIGenerationPage />;
      case 'settings':
        return (
          <SettingsPage
            darkMode={darkMode}
            onThemeToggle={handleThemeToggle}
            themeColor={themeColor}
            onThemeColorChange={handleThemeColorChange}
          />
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

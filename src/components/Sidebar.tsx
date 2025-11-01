import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme,
  Avatar,
  Switch,
} from '@mui/material';
import {
  CheckSquare as TaskIcon,
  Target,
  TrendingUp,
  Archive as ArchiveIcon,
  Sparkles,
  Settings as SettingsIcon,
  Lightbulb,
  Moon,
  Menu as MenuIcon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getNextEncouragement } from '../utils/encouragementService';

// 侧边栏属性接口
interface SidebarProps {
  currentPage: string; // 当前页面
  onNavigate: (page: string) => void; // 导航回调
  darkMode: boolean; // 深色模式
  onThemeToggle: () => void; // 主题切换回调
  mobileOpen: boolean; // 移动端抽屉开关
  onDrawerToggle: () => void; // 抽屉切换回调
}

// 侧边栏组件
export const Sidebar: React.FC<SidebarProps> = ({
  currentPage, // 当前页面
  onNavigate, // 导航函数
  darkMode, // 深色模式状态
  onThemeToggle, // 主题切换
  mobileOpen, // 移动端打开状态
  onDrawerToggle // 抽屉切换
}) => {
  // 获取应用状态
  const { state } = useApp();
  // 主题
  const theme = useTheme();
  // 是否为移动端
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  // 鼓励语状态
  const [encouragement, setEncouragement] = useState('任务完成 ✓ 奖励：硬大战！😎');

  // 当有任务完成时更新鼓励语
  useEffect(() => {
    const updateEncouragement = async () => {
      const message = await getNextEncouragement();
      setEncouragement(message);
    };

    // 监听任务完成数量的变化
    const completedCount = state.tasks.filter(task => task.completed && !task.isArchived).length;
    if (completedCount > 0) {
      updateEncouragement();
    }
  }, [state.tasks]);

  // 导航项配置
  const navItems = [
    {
      section: encouragement, // 鼓励语部分
      items: [
        { id: 'dashboard', icon: TaskIcon, label: '任务', badge: null },
        { id: 'habits', icon: Target, label: '习惯', badge: null },
      ],
    },
    {
      section: '', // 空部分
      items: [
        { id: 'overview', icon: TrendingUp, label: '概览', badge: null },
        { id: 'archive', icon: ArchiveIcon, label: '存档', badge: null },
      ],
    },
    {
      section: '', // 空部分
      items: [
        { id: 'ai-generation', icon: Sparkles, label: 'AI规划', badge: null },
        { id: 'settings', icon: SettingsIcon, label: '设置', badge: null },
      ],
    },
  ];

  // 抽屉宽度
  const drawerWidth = 280;

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo and User Section */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          sx={{
            width: 64,
            height: 64,
            bgcolor: 'transparent',
          }}
          src="./icon.png"
          alt="Deadliner Icon"
        />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Deadliner
        </Typography>
      </Box>

      <Divider />

      {/* Navigation List */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 2 }}>
        {navItems.map((section, sectionIndex) => (
          <Box key={sectionIndex} sx={{ mb: 1 }}>
            {section.section && (
              <Typography
                variant="caption"
                sx={{
                  px: 2,
                  py: 1,
                  display: 'block',
                  color: 'text.secondary',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              >
                {section.section}
              </Typography>
            )}
            <List disablePadding>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      selected={isActive}
                      onClick={() => onNavigate(item.id)}
                      sx={{
                        borderRadius: 2,
                        py: 1.5,
                        '&.Mui-selected': {
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                          '&:hover': {
                            bgcolor: 'primary.dark',
                          },
                          '& .MuiListItemIcon-root': {
                            color: 'inherit',
                          },
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Icon size={20} />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontSize: '0.875rem',
                          fontWeight: isActive ? 600 : 500,
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      <Divider />

      {/* Theme Toggle */}
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1,
            bgcolor: 'background.paper',
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {darkMode ? <Moon size={18} /> : <Lightbulb size={18} />}
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {darkMode ? '深色模式' : '浅色模式'}
            </Typography>
          </Box>
          <Switch
            checked={darkMode}
            onChange={onThemeToggle}
            size="small"
          />
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <IconButton
          onClick={onDrawerToggle}
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: theme.zIndex.drawer + 2,
            bgcolor: 'background.paper',
            '&:hover': {
              bgcolor: 'background.paper',
            },
          }}
        >
          <MenuIcon size={24} />
        </IconButton>
      )}

      {/* Mobile Drawer */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onDrawerToggle}
          ModalProps={{
            keepMounted: true, // 在移动端保持更好的打开性能
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        // 桌面端固定抽屉
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: 'none',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};
import React, { useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Button,
  Stack,
  Menu,
  MenuItem,
  LinearProgress,
  ToggleButtonGroup,
  ToggleButton,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  ArchiveRestore as Unarchive,
  Trash2,
  Star,
  CheckSquare,
  Target,
  MoreVertical,
  Grid3x3 as GridIcon,
  List as ListIcon,
  Undo,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ConfirmDialog } from './ConfirmDialog';
import { undoManager } from '../utils/undoManager';

// 存档页面组件
export const ArchivePage: React.FC = () => {
  // 获取应用状态和 dispatch 函数
  const { state, dispatch } = useApp();
  // 视图模式：网格或列表
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  // 菜单锚点元素
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  // 选中的任务
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  // 删除对话框开关
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  // 要删除的任务
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  // 撤销提示开关
  const [undoSnackbarOpen, setUndoSnackbarOpen] = useState(false);
  // 最后删除的任务
  const [lastDeletedTask, setLastDeletedTask] = useState<Task | null>(null);
  // 撤销操作 ID
  const [undoActionId, setUndoActionId] = useState<string | null>(null);

  // 获取所有已归档的任务
  const archivedTasks = useMemo(() => {
    return state.tasks.filter(task => task.isArchived);
  }, [state.tasks]);

  // 统计数据
  const stats = useMemo(() => {
    const total = archivedTasks.length; // 总项目数
    const tasks = archivedTasks.filter(t => t.type === 'task').length; // 任务数
    const habits = archivedTasks.filter(t => t.type === 'habit').length; // 习惯数
    const completed = archivedTasks.filter(t => t.completed).length; // 已完成数

    return { total, tasks, habits, completed };
  }, [archivedTasks]);

  // 打开菜单
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, task: Task) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedTask(task);
  };

  // 关闭菜单
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedTask(null);
  };

  // 取消归档任务
  const handleUnarchive = () => {
    if (selectedTask) {
      dispatch({ type: 'UNARCHIVE_TASK', payload: selectedTask.id });
    }
    handleMenuClose();
  };

  // 处理删除
  const handleDelete = () => {
    if (selectedTask) {
      setTaskToDelete(selectedTask);
      setDeleteDialogOpen(true);
    }
    handleMenuClose(); // 现在可以安全地关闭菜单
  };

  // 确认删除任务
  const confirmDelete = async () => {
    if (taskToDelete) {
      try {
        // 先调用数据库删除
        await window.electron.storage.deleteTask(taskToDelete.id);

        // 保存任务数据用于撤销
        setLastDeletedTask(taskToDelete);
        const actionId = undoManager.addAction({
          type: 'delete_task',
          data: taskToDelete,
          description: `删除任务 "${taskToDelete.title}"`,
        });
        setUndoActionId(actionId);

        // 更新前端状态
        dispatch({ type: 'DELETE_TASK', payload: taskToDelete.id });

        // 显示撤销提示
        setUndoSnackbarOpen(true);
        setDeleteDialogOpen(false);
        setTaskToDelete(null); // 清理 taskToDelete
      } catch (error) {
        console.error('Failed to delete task:', error);
        // 可以在这里显示错误提示给用户
      }
    }
  };

  // 处理撤销操作
  const handleUndo = async () => {
    if (undoActionId && lastDeletedTask) {
      try {
        const action = undoManager.undo(undoActionId);
        if (action) {
          console.log('Undoing delete for task:', lastDeletedTask.id, lastDeletedTask.title);

          // 恢复前端状态 - 确保任务有正确的 isArchived 状态
          const taskToRestore = {
            ...lastDeletedTask,
            isArchived: true, // 确保任务在存档中心显示
          };

          console.log('Dispatching ADD_TASK with task:', taskToRestore);
          dispatch({
            type: 'ADD_TASK',
            payload: taskToRestore,
          });

          // 然后尝试将任务添加到数据库
          try {
            const result = await window.electron.storage.createTask(taskToRestore);
            console.log('Database create result:', result);
          } catch (dbError) {
            console.error('Database create failed, but frontend state updated:', dbError);
            // 前端状态已经更新，即使数据库操作失败
          }
        }
      } catch (error) {
        console.error('Failed to restore task:', error);
      }
    }
    setUndoSnackbarOpen(false);
    setLastDeletedTask(null);
    setUndoActionId(null);
  };

  // 获取优先级颜色
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error'; // 高优先级
      case 'medium': return 'warning'; // 中优先级
      case 'low': return 'success'; // 低优先级
      default: return 'default'; // 默认
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <Box
        sx={{
          px: { xs: 2, md: 4 },
          py: 3,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
           存档中心
          </Typography>
          <Typography variant="body2" color="text.secondary">
            管理您的 {stats.total} 个已存档项目
          </Typography>
        </Box>

        {/* View Mode Toggle */}
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, newMode) => newMode && setViewMode(newMode)}
          size="small"
        >
          <ToggleButton value="list">
            <ListIcon size={18} />
          </ToggleButton>
          <ToggleButton value="grid">
            <GridIcon size={18} />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ px: { xs: 2, md: 4 }, py: 3, bgcolor: 'background.default' }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card elevation={0} sx={{ textAlign: 'center', bgcolor: 'grey.700', color: 'white' }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stats.total}
                </Typography>
                <Typography variant="body2">总项目</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card elevation={0} sx={{ textAlign: 'center', bgcolor: 'primary.main', color: 'primary.contrastText' }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stats.tasks}
                </Typography>
                <Typography variant="body2">任务</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card elevation={0} sx={{ textAlign: 'center', bgcolor: 'secondary.main', color: 'secondary.contrastText' }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stats.habits}
                </Typography>
                <Typography variant="body2">习惯</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card elevation={0} sx={{ textAlign: 'center', bgcolor: 'success.main', color: 'success.contrastText' }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stats.completed}
                </Typography>
                <Typography variant="body2">已完成</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Archive List */}
      <Box sx={{ flex: 1, overflow: 'auto', px: { xs: 2, md: 4 }, pb: 4 }}>
        {archivedTasks.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center',
            }}
          >
            <Typography variant="h4" sx={{ mb: 2 }}>
              📦
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              还没有存档的项目
            </Typography>
            <Typography variant="body2" color="text.secondary">
              完成的任务和习惯会自动存档到这里
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={viewMode === 'grid' ? 3 : 2}>
            {archivedTasks.map((task) => {
              const category = state.categories.find(cat => cat.id === task.category);

              return (
                <Grid
                  size={{
                    xs: 12,
                    sm: viewMode === 'grid' ? 6 : 12,
                    md: viewMode === 'grid' ? 4 : 12,
                    lg: viewMode === 'grid' ? 3 : 12,
                  }}
                  key={task.id}
                >
                  <Card
                    elevation={1}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      opacity: 0.85,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        opacity: 1,
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <CardContent sx={{ flex: 1 }}>
                      {/* Header */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <Chip
                          icon={task.type === 'habit' ? <Target size={14} /> : <CheckSquare size={14} />}
                          label={task.type === 'habit' ? '习惯' : '任务'}
                          size="small"
                          color={task.type === 'habit' ? 'secondary' : 'primary'}
                          sx={{ mr: 1 }}
                        />
                        <Box sx={{ flex: 1 }} />
                        {task.isStarred && (
                          <Star size={16} fill="currentColor" color="#ffc107" style={{ marginRight: 4 }} />
                        )}
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, task)}
                          sx={{ p: 0.5 }}
                        >
                          <MoreVertical size={18} />
                        </IconButton>
                      </Box>

                      {/* Title */}
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 1,
                          fontSize: '1rem',
                          fontWeight: 600,
                          textDecoration: task.completed ? 'line-through' : 'none',
                        }}
                      >
                        {task.title}
                      </Typography>

                      {/* Description */}
                      {task.description && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mb: 1.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {task.description}
                        </Typography>
                      )}

                      {/* Category */}
                      {category && (
                        <Chip
                          label={category.name}
                          size="small"
                          sx={{
                            mb: 1.5,
                            bgcolor: category.color,
                            color: 'white',
                          }}
                        />
                      )}

                      {/* Habit Progress */}
                      {task.type === 'habit' && (
                        <Box sx={{ mb: 1.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              进度
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {task.progress || 0}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={task.progress || 0}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Box>
                      )}

                      {/* Tags */}
                      {task.tags && task.tags.length > 0 && (
                        <Stack direction="row" spacing={0.5} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
                          {task.tags.slice(0, 2).map((tag, index) => (
                            <Chip
                              key={index}
                              label={tag}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          ))}
                          {task.tags.length > 2 && (
                            <Chip
                              label={`+${task.tags.length - 2}`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          )}
                        </Stack>
                      )}

                      {/* Priority & Status */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip
                          label={task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                          size="small"
                          color={getPriorityColor(task.priority) as any}
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                        {task.completed && (
                          <Chip
                            label="已完成"
                            size="small"
                            color="success"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        )}
                      </Box>

                      {/* Archive Time */}
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        归档于 {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true, locale: zhCN })}
                      </Typography>
                    </CardContent>

                    {/* Actions */}
                    <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Unarchive size={18} />}
                        onClick={() => {
                          dispatch({ type: 'UNARCHIVE_TASK', payload: task.id });
                        }}
                      >
                        恢复
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>

      {/* Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleUnarchive}>
          <Unarchive size={18} style={{ marginRight: 8 }} />
          取消归档
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Trash2 size={18} style={{ marginRight: 8 }} />
          永久删除
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setTaskToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="确认删除"
        description={`确定要永久删除任务"${taskToDelete?.title}"吗？此操作无法撤销。`}
        confirmText="删除"
        cancelText="取消"
        confirmColor="error"
        severity="error"
      />

      {/* Undo Snackbar */}
      <Snackbar
        open={undoSnackbarOpen}
        autoHideDuration={5000}
        onClose={() => setUndoSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="info"
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<Undo size={16} />}
              onClick={handleUndo}
            >
              撤销
            </Button>
          }
          sx={{ minWidth: 300 }}
        >
          任务已删除
        </Alert>
      </Snackbar>
    </Box>
  );
};
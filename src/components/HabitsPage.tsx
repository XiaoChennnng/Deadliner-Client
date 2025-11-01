import React, { useState, useMemo } from 'react';
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
  Fab,
  Tooltip,
  AppBar,
  Toolbar,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import {
  Target,
  Star,
  MoreVertical,
  CheckCircle,
  Archive,
  Trash2,
  Flame,
  Search,
  Grid3x3 as GridIcon,
  List as ListIcon,
  ArrowUpDown as SortByAlpha,
  CheckSquare,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// 习惯页面属性接口
interface HabitsPageProps {
  onAddHabit: () => void; // 添加习惯回调
  onEditHabit: (habit: Task) => void; // 编辑习惯回调
}

// 习惯页面组件
export const HabitsPage: React.FC<HabitsPageProps> = ({ onAddHabit, onEditHabit }) => {
  // 获取应用状态和 dispatch 函数
  const { state, dispatch } = useApp();
  // 菜单锚点
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  // 选中的习惯
  const [selectedHabit, setSelectedHabit] = useState<Task | null>(null);
  // 搜索查询
  const [searchQuery, setSearchQuery] = useState('');
  // 视图模式
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  // 排序菜单锚点
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  // 排序方式
  const [sortBy, setSortBy] = useState<'created' | 'updated' | 'priority'>('created');
  // 删除对话框开关
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  // 要删除的习惯
  const [habitToDelete, setHabitToDelete] = useState<Task | null>(null);
  // 批量删除对话框开关
  const [batchDeleteDialogOpen, setBatchDeleteDialogOpen] = useState(false);

  // 获取所有未归档的习惯并过滤搜索
  const habits = useMemo(() => {
    let filtered = state.tasks.filter(task => task.type === 'habit' && !task.isArchived);

    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(habit =>
        habit.title.toLowerCase().includes(query) ||
        habit.description?.toLowerCase().includes(query)
      );
    }

    // 排序：星标优先置顶，然后按选择的排序规则
    filtered.sort((a, b) => {
      const starDiff = Number(b.isStarred) - Number(a.isStarred);
      if (starDiff !== 0) return starDiff;

      switch (sortBy) {
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // 创建时间降序
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(); // 更新时间降序
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority]; // 优先级降序
        default:
          return 0;
      }
    });

    return filtered;
  }, [state.tasks, searchQuery, sortBy]);

  // 统计数据
  const stats = useMemo(() => {
    const total = habits.length; // 总习惯数
    const completed = habits.filter(h => h.completed).length; // 已完成数
    const active = habits.filter(h => !h.completed).length; // 活跃数
    const avgProgress = habits.length > 0
      ? Math.round(habits.reduce((sum, h) => sum + (h.progress || 0), 0) / habits.length)
      : 0; // 平均进度
    const totalStreak = habits.reduce((sum, h) => sum + (h.streak || 0), 0); // 总连续天数

    return { total, completed, active, avgProgress, totalStreak };
  }, [habits]);

  // 打开菜单
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, habit: Task) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedHabit(habit);
  };

  // 关闭菜单
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedHabit(null);
  };

  // 切换完成状态
  const handleToggleComplete = (habitId: string) => {
    dispatch({ type: 'TOGGLE_TASK_COMPLETION', payload: habitId });
  };

  // 切换星标状态
  const handleToggleStar = (habitId: string) => {
    dispatch({ type: 'TOGGLE_TASK_STAR', payload: habitId });
  };

  // 归档习惯
  const handleArchive = () => {
    if (selectedHabit) {
      dispatch({ type: 'ARCHIVE_TASK', payload: selectedHabit.id });
    }
    handleMenuClose();
  };

  // 处理删除
  const handleDelete = () => {
    if (selectedHabit) {
      setHabitToDelete(selectedHabit);
      setDeleteDialogOpen(true);
    }
    handleMenuClose();
  };

  // 确认删除习惯
  const confirmDelete = async () => {
    if (habitToDelete) {
      try {
        if (window.electron) {
          await window.electron.storage.deleteTask(habitToDelete.id); // 从数据库删除
        }
        dispatch({ type: 'DELETE_TASK', payload: habitToDelete.id }); // 更新状态
        setDeleteDialogOpen(false);
        setHabitToDelete(null);
        setSelectedHabit(null);
      } catch (error) {
        console.error('Failed to delete habit:', error);
        alert('删除失败,请重试');
      }
    }
  };

  // 处理批量删除
  const handleBatchDelete = () => {
    setBatchDeleteDialogOpen(true);
  };

  // 确认批量删除
  const confirmBatchDelete = () => {
    const selectedTaskIds = Array.from(state.selectedTasks);
    dispatch({ type: 'BATCH_DELETE_TASKS', payload: selectedTaskIds });
    setBatchDeleteDialogOpen(false);
  };

  // 处理编辑
  const handleEdit = () => {
    if (selectedHabit) {
      onEditHabit(selectedHabit);
    }
    handleMenuClose();
  };

  // 处理排序变化
  const handleSortChange = (newSortBy: typeof sortBy) => {
    setSortBy(newSortBy);
    setSortAnchorEl(null);
  };

  // 切换多选模式
  const toggleMultiSelect = () => {
    dispatch({ type: 'TOGGLE_MULTI_SELECT' });
  };

  // 处理选择习惯
  const handleSelect = (habitId: string) => {
    if (state.selectedTasks.has(habitId)) {
      dispatch({ type: 'DESELECT_TASK', payload: habitId }); // 取消选择
    } else {
      dispatch({ type: 'SELECT_TASK', payload: habitId }); // 选择
    }
  };

  // 批量完成
  const handleBatchComplete = () => {
    const selectedTaskIds = Array.from(state.selectedTasks);
    dispatch({ type: 'BATCH_COMPLETE_TASKS', payload: selectedTaskIds });
  };

  // 批量归档
  const handleBatchArchive = () => {
    const selectedTaskIds = Array.from(state.selectedTasks);
    dispatch({ type: 'BATCH_ARCHIVE_TASKS', payload: selectedTaskIds });
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
      {/* Header with Search */}
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ px: { xs: 2, md: 4 }, py: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              习惯追踪
            </Typography>
            <Typography variant="body2" color="text.secondary">
              培养良好习惯，坚持每一天
            </Typography>
          </Box>

          {/* Search */}
          <TextField
            placeholder="搜索习惯..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} />
                </InputAdornment>
              ),
            }}
            sx={{ mr: 2, width: 250 }}
          />

          {/* View Mode Toggle */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newMode) => newMode && setViewMode(newMode)}
            size="small"
            sx={{ mr: 2 }}
          >
            <ToggleButton value="list">
              <ListIcon size={18} />
            </ToggleButton>
            <ToggleButton value="grid">
              <GridIcon size={18} />
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Sort Button */}
          <Button
            variant="outlined"
            size="small"
            startIcon={<SortByAlpha size={18} />}
            onClick={(e) => setSortAnchorEl(e.currentTarget)}
            sx={{ mr: 2 }}
          >
            排序
          </Button>
          <Menu
            anchorEl={sortAnchorEl}
            open={Boolean(sortAnchorEl)}
            onClose={() => setSortAnchorEl(null)}
          >
            <MenuItem onClick={() => handleSortChange('created')}>创建时间</MenuItem>
            <MenuItem onClick={() => handleSortChange('updated')}>更新时间</MenuItem>
            <MenuItem onClick={() => handleSortChange('priority')}>优先级</MenuItem>
          </Menu>

          {/* Multi-select Toggle */}
          <Button
            variant={state.isMultiSelectMode ? 'contained' : 'outlined'}
            size="small"
            startIcon={<CheckSquare size={18} />}
            onClick={toggleMultiSelect}
          >
            多选
          </Button>
        </Toolbar>
      </AppBar>

      {/* Stats Cards */}
      <Box sx={{ px: { xs: 2, md: 4 }, py: 3, bgcolor: 'background.default' }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card elevation={0} sx={{ textAlign: 'center', bgcolor: 'primary.main', color: 'primary.contrastText' }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stats.total}
                </Typography>
                <Typography variant="body2">总习惯</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card elevation={0} sx={{ textAlign: 'center', bgcolor: 'success.main', color: 'success.contrastText' }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stats.completed}
                </Typography>
                <Typography variant="body2">已完成</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card elevation={0} sx={{ textAlign: 'center', bgcolor: 'info.main', color: 'info.contrastText' }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stats.avgProgress}%
                </Typography>
                <Typography variant="body2">平均进度</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Card elevation={0} sx={{ textAlign: 'center', bgcolor: 'warning.main', color: 'warning.contrastText' }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stats.totalStreak}
                </Typography>
                <Typography variant="body2">总连续天数</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Multi-select Toolbar */}
      {state.isMultiSelectMode && state.selectedTasks.size > 0 && (
        <Paper
          elevation={3}
          sx={{
            mx: { xs: 2, md: 4 },
            mb: 2,
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }}
        >
          <Typography variant="body1" sx={{ flex: 1, fontWeight: 600 }}>
            已选中 {state.selectedTasks.size} 个习惯
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<CheckSquare size={18} />}
            onClick={handleBatchComplete}
            sx={{ bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}
          >
            完成
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<Archive size={18} />}
            onClick={handleBatchArchive}
            sx={{ bgcolor: 'warning.main', '&:hover': { bgcolor: 'warning.dark' } }}
          >
            归档
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<Trash2 size={18} />}
            onClick={handleBatchDelete}
            sx={{ bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' } }}
          >
            删除
          </Button>
          <IconButton
            size="small"
            onClick={toggleMultiSelect}
            sx={{ color: 'inherit' }}
          >
            <X size={18} />
          </IconButton>
        </Paper>
      )}

      {/* Habits Grid */}
      <Box sx={{ flex: 1, overflow: 'auto', px: { xs: 2, md: 4 }, pb: 4 }}>
        {habits.length === 0 ? (
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
              🎯
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              还没有习惯
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              创建您的第一个习惯，开始坚持每一天
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={viewMode === 'grid' ? 3 : 2}>
            {habits.map((habit) => {
              const isSelected = state.selectedTasks.has(habit.id);
              return (
                <Grid
                  key={habit.id}
                  size={{
                    xs: 12,
                    sm: viewMode === 'grid' ? 6 : 12,
                    md: viewMode === 'grid' ? 4 : 12,
                    lg: viewMode === 'grid' ? 3 : 12,
                  }}
                >
                  <Card
                    elevation={isSelected ? 8 : (habit.completed ? 0 : 2)}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      opacity: habit.completed ? 0.7 : 1,
                      transition: 'all 0.3s ease',
                      bgcolor: isSelected ? 'action.selected' : 'background.paper',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                  >
                    <CardContent sx={{ flex: 1 }}>
                      {/* Header */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {state.isMultiSelectMode && (
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => handleSelect(habit.id)}
                            sx={{ mr: 1, p: 0 }}
                          />
                        )}

                        <Box sx={{ flex: 1 }} />
                        <Tooltip title={habit.isStarred ? '取消标星' : '标星'}>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleStar(habit.id)}
                            sx={{ color: habit.isStarred ? 'warning.main' : 'action.disabled', p: 0.5 }}
                          >
                            <Star size={18} fill={habit.isStarred ? 'currentColor' : 'none'} />
                          </IconButton>
                        </Tooltip>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, habit)}
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
                          fontWeight: 600,
                          textDecoration: habit.completed ? 'line-through' : 'none',
                        }}
                      >
                        {habit.title}
                      </Typography>

                      {/* Description */}
                      {habit.description && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mb: 2,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {habit.description}
                        </Typography>
                      )}

                      {/* Streak */}
                      {habit.streak && habit.streak > 0 && (
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                          <Flame size={16} color="#ff9800" />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'warning.main' }}>
                            连续打卡 {habit.streak} 天
                          </Typography>
                        </Stack>
                      )}

                      {/* Priority & Time */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip
                          label={habit.priority === 'high' ? '高' : habit.priority === 'medium' ? '中' : '低'}
                          size="small"
                          color={getPriorityColor(habit.priority) as any}
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(new Date(habit.createdAt), { addSuffix: true, locale: zhCN })}
                        </Typography>
                      </Box>
                    </CardContent>

                    {/* Actions */}
                    <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                      <Button
                        fullWidth
                        variant={habit.completed ? 'outlined' : 'contained'}
                        color={habit.completed ? 'success' : 'primary'}
                        startIcon={<CheckCircle size={18} />}
                        onClick={() => handleToggleComplete(habit.id)}
                      >
                        {habit.completed ? '已完成' : '标记完成'}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>

      {/* FAB for Add Habit */}
      <Fab
        color="primary"
        onClick={onAddHabit}
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          width: 64,
          height: 64,
          boxShadow: 6,
          '&:hover': {
            boxShadow: 12,
          },
        }}
      >
        <AddRoundedIcon sx={{ fontSize: 32 }} />
      </Fab>

      {/* Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <Target size={18} style={{ marginRight: 8 }} />
          编辑
        </MenuItem>
        <MenuItem onClick={handleArchive}>
          <Archive size={18} style={{ marginRight: 8 }} />
          归档
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Trash2 size={18} style={{ marginRight: 8 }} />
          删除
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setHabitToDelete(null);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <Typography>
            确定要删除"{habitToDelete?.title}"吗？此操作无法撤销。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDeleteDialogOpen(false);
            setHabitToDelete(null);
          }}>
            取消
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            删除
          </Button>
        </DialogActions>
      </Dialog>

      {/* Batch Delete Confirmation Dialog */}
      <Dialog open={batchDeleteDialogOpen} onClose={() => setBatchDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>确认批量删除</DialogTitle>
        <DialogContent>
          <Typography>
            确定要删除选中的 {state.selectedTasks.size} 个习惯吗？此操作无法撤销。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBatchDeleteDialogOpen(false)}>取消</Button>
          <Button onClick={confirmBatchDelete} color="error" variant="contained">
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
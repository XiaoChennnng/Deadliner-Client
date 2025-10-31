import React, { useState, useMemo } from 'react';
import {
  Box,
  Grid,
  Typography,
  Chip,
  IconButton,
  Toolbar,
  AppBar,
  Menu,
  MenuItem,
  Button,
  TextField,
  InputAdornment,
  Fab,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
  Stack,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import {
  Grid3x3 as GridIcon,
  List as ListIcon,
  ArrowUpDown as SortByAlpha,
  CheckSquare,
  Archive,
  Trash2,
  X,
  Search,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TaskItem } from './TaskItemMUI';
import { Task } from '../types';

interface TaskListProps {
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ onAddTask, onEditTask }) => {
  const { state, dispatch } = useApp();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [batchDeleteDialogOpen, setBatchDeleteDialogOpen] = useState(false);

  // 过滤和排序任务
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = state.tasks.filter(task => {
      // 按归档状态过滤
      if (task.isArchived && state.currentView !== 'archive') return false;
      if (!task.isArchived && state.currentView === 'archive') return false;

      // 只显示任务（不包括习惯）
      if (task.type !== 'task') return false;

      // 按搜索关键词过滤
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query)
        );
      }

      return true;
    });

    // 排序任务：星标优先，然后按选定的排序键
    filtered.sort((a, b) => {
      const starDiff = Number(b.isStarred) - Number(a.isStarred);
      if (starDiff !== 0) return starDiff;

      switch (state.sortBy) {
        case 'deadline':
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        default:
          return 0;
      }
    });

    return filtered;
  }, [state.tasks, state.currentFilter, state.selectedCategory, searchQuery, state.sortBy, state.currentView]);

  const handleFilterChange = (filter: typeof state.currentFilter) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  };

  const handleSortChange = (sortBy: typeof state.sortBy) => {
    dispatch({ type: 'SET_SORT', payload: sortBy });
    setSortAnchorEl(null);
  };

  const toggleMultiSelect = () => {
    dispatch({ type: 'TOGGLE_MULTI_SELECT' });
  };

  const handleBatchComplete = () => {
    const selectedTaskIds = Array.from(state.selectedTasks);
    dispatch({ type: 'BATCH_COMPLETE_TASKS', payload: selectedTaskIds });
  };

  const handleBatchDelete = () => {
    setBatchDeleteDialogOpen(true);
  };

  const confirmBatchDelete = () => {
    const selectedTaskIds = Array.from(state.selectedTasks);
    dispatch({ type: 'BATCH_DELETE_TASKS', payload: selectedTaskIds });
    setBatchDeleteDialogOpen(false);
  };

  const handleBatchArchive = () => {
    const selectedTaskIds = Array.from(state.selectedTasks);
    dispatch({ type: 'BATCH_ARCHIVE_TASKS', payload: selectedTaskIds });
  };

  const taskStats = useMemo(() => {
    const total = filteredAndSortedTasks.length;
    const completed = filteredAndSortedTasks.filter(t => t.completed).length;
    const overdue = filteredAndSortedTasks.filter(t =>
      t.deadline && new Date(t.deadline) < new Date() && !t.completed
    ).length;
    return { total, completed, overdue };
  }, [filteredAndSortedTasks]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top AppBar */}
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ px: { xs: 2, md: 4 }, py: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {state.currentView === 'archive' ? '存档中心' : '任务'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {state.currentView === 'archive'
                ? `管理您的 ${taskStats.total} 个已存档项目`
                : `跟踪您的进度，管理 ${taskStats.total} 个项目`
              }
            </Typography>
          </Box>

          {/* Search */}
          <TextField
            placeholder="搜索任务..."
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
            <MenuItem onClick={() => handleSortChange('deadline')}>截止时间</MenuItem>
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
          <Grid size={{ xs: 4 }}>
            <Card elevation={0} sx={{ textAlign: 'center', bgcolor: 'primary.main', color: 'primary.contrastText' }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {taskStats.total}
                </Typography>
                <Typography variant="body2">
                  总任务
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Card elevation={0} sx={{ textAlign: 'center', bgcolor: 'success.main', color: 'success.contrastText' }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {taskStats.completed}
                </Typography>
                <Typography variant="body2">
                  已完成
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Card elevation={0} sx={{ textAlign: 'center', bgcolor: 'error.main', color: 'error.contrastText' }}>
              <CardContent>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {taskStats.overdue}
                </Typography>
                <Typography variant="body2">
                  已逾期
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Filter Chips - Removed since we only show tasks now */}

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
            已选中 {state.selectedTasks.size} 个项目
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

      {/* Task List/Grid */}
      <Box sx={{ flex: 1, overflow: 'auto', px: { xs: 2, md: 4 }, pb: 4 }}>
        {filteredAndSortedTasks.length === 0 ? (
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
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              暂无任务
            </Typography>
            <Typography variant="body2" color="text.secondary">
              点击右下角的按钮添加新任务
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={viewMode === 'grid' ? 3 : 2}>
            {filteredAndSortedTasks.map((task) => (
              <Grid
                key={task.id}
                size={{
                  xs: 12,
                  sm: viewMode === 'grid' ? 6 : 12,
                  md: viewMode === 'grid' ? 4 : 12,
                  lg: viewMode === 'grid' ? 3 : 12,
                }}
              >
                <TaskItem task={task} viewMode={viewMode} onEdit={onEditTask} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* FAB for Add Task */}
      <Fab
        color="primary"
        onClick={onAddTask}
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

      {/* Batch Delete Confirmation Dialog */}
      <Dialog open={batchDeleteDialogOpen} onClose={() => setBatchDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>确认批量删除</DialogTitle>
        <DialogContent>
          <Typography>
            确定要删除选中的 {state.selectedTasks.size} 个任务吗？此操作无法撤销。
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
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  IconButton,
  Box,
  LinearProgress,
  Checkbox,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Clock,
  Star,
  MoreVertical,
  CheckSquare,
  Archive,
  Trash2,
  Target,
  Edit,
} from 'lucide-react';
import { Task } from '../types';
import { useApp } from '../context/AppContext';
import { formatDistanceToNow, differenceInDays, differenceInHours } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface TaskItemProps {
  task: Task;
  viewMode?: 'grid' | 'list';
  onEdit?: (task: Task) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, viewMode = 'grid', onEdit }) => {
  const { state, dispatch } = useApp();
  const theme = useTheme();
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const isSelected = state.selectedTasks.has(task.id);
  const category = state.categories.find(cat => cat.id === task.category);

  const handleToggleComplete = () => {
    dispatch({ type: 'TOGGLE_TASK_COMPLETION', payload: task.id });
  };

  const handleToggleStar = () => {
    dispatch({ type: 'TOGGLE_TASK_STAR', payload: task.id });
  };

  const handleDelete = () => {
    setMenuAnchorEl(null);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    dispatch({ type: 'DELETE_TASK', payload: task.id });
    setDeleteDialogOpen(false);
  };

  const handleArchive = () => {
    dispatch({ type: 'ARCHIVE_TASK', payload: task.id });
    setMenuAnchorEl(null);
  };

  const handleSelect = () => {
    if (isSelected) {
      dispatch({ type: 'DESELECT_TASK', payload: task.id });
    } else {
      dispatch({ type: 'SELECT_TASK', payload: task.id });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return theme.palette.error.main;
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.grey[400];
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return '高';
      case 'medium': return '中';
      case 'low': return '低';
      default: return '';
    }
  };

  // Calculate deadline progress and status
  const getDeadlineInfo = () => {
    if (!task.deadline) return null;

    const now = new Date();
    const deadline = new Date(task.deadline);
    const created = new Date(task.createdAt);

    const totalTime = deadline.getTime() - created.getTime();
    const elapsedTime = now.getTime() - created.getTime();
    const remainingTime = deadline.getTime() - now.getTime();

    // 进度条表示已经过去的时间百分比（0% = 刚开始，100% = 时间耗尽）
    const progressPercentage = Math.max(0, Math.min(100, (elapsedTime / totalTime) * 100));
    const daysRemaining = differenceInDays(deadline, now);
    const hoursRemaining = differenceInHours(deadline, now);

    let statusColor = theme.palette.success.main;
    let statusText = '';

    if (remainingTime < 0) {
      statusColor = theme.palette.error.main;
      statusText = '已逾期';
    } else if (daysRemaining === 0) {
      statusColor = theme.palette.warning.main;
      statusText = hoursRemaining <= 12 ? `${hoursRemaining}小时后截止` : '今天截止';
    } else if (daysRemaining === 1) {
      statusColor = theme.palette.warning.light;
      statusText = '明天截止';
    } else if (daysRemaining <= 3) {
      statusColor = theme.palette.info.main;
      statusText = `${daysRemaining}天后截止`;
    } else {
      statusText = `剩余${daysRemaining}天`;
    }

    return {
      progressPercentage,
      statusColor,
      statusText,
      daysRemaining,
      remainingTime,
      deadline,
    };
  };

  const deadlineInfo = getDeadlineInfo();

  return (
    <Card
      elevation={isSelected ? 8 : 1}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        opacity: task.completed ? 0.7 : 1,
        bgcolor: isSelected ? 'action.selected' : 'background.paper',
        '&:hover': {
          elevation: 3,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent sx={{ flex: 1, pb: 1 }}>
        {/* Header: Checkbox, Star */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          {state.isMultiSelectMode && (
            <Checkbox
              size="small"
              checked={isSelected}
              onChange={handleSelect}
              sx={{ mr: 1, p: 0 }}
            />
          )}

          <Box sx={{ flex: 1 }} />

          <Tooltip title={task.isStarred ? '取消标星' : '标星'}>
            <IconButton
              size="small"
              onClick={handleToggleStar}
              sx={{
                color: task.isStarred ? 'warning.main' : 'action.disabled',
                p: 0.5,
              }}
            >
              <Star size={18} fill={task.isStarred ? 'currentColor' : 'none'} />
            </IconButton>
          </Tooltip>

          <IconButton
            size="small"
            onClick={(e) => setMenuAnchorEl(e.currentTarget)}
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
            color: task.completed ? 'text.disabled' : 'text.primary',
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



        {/* Habit Streak */}
        {task.type === 'habit' && task.streak && task.streak > 0 && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              🔥 连续打卡 {task.streak} 天
            </Typography>
          </Box>
        )}

        {/* Deadline Info */}
        {deadlineInfo && (
          <Box sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <Clock size={14} />
              <Typography variant="caption" sx={{ color: deadlineInfo.statusColor, fontWeight: 500 }}>
                {deadlineInfo.statusText}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={deadlineInfo.progressPercentage}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: 'action.hover',
                '& .MuiLinearProgress-bar': {
                  bgcolor: deadlineInfo.statusColor,
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        )}

        {/* Priority Badge */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
          <Chip
            label={getPriorityLabel(task.priority)}
            size="small"
            sx={{
              bgcolor: getPriorityColor(task.priority),
              color: theme.palette.getContrastText(getPriorityColor(task.priority)),
              fontSize: '0.7rem',
              height: 20,
            }}
          />
          <Typography variant="caption" color="text.secondary">
            {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true, locale: zhCN })}
          </Typography>
        </Box>
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
        <Checkbox
          checked={task.completed}
          onChange={handleToggleComplete}
          icon={<CheckSquare size={20} />}
          checkedIcon={<CheckSquare size={20} />}
          sx={{
            color: 'success.main',
            '&.Mui-checked': {
              color: 'success.main',
            },
          }}
        />
        <Typography variant="body2" sx={{ flex: 1, ml: 1 }}>
          {task.completed ? '已完成' : '标记完成'}
        </Typography>
      </CardActions>

      {/* Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={() => setMenuAnchorEl(null)}
      >
        <MenuItem onClick={() => {
          setMenuAnchorEl(null);
          if (onEdit) onEdit(task);
        }}>
          <Edit size={18} style={{ marginRight: 8 }} />
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
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <Typography>
            确定要删除"{task.title}"吗？此操作无法撤销。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>取消</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};
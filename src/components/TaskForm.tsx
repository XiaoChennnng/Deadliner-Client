import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  Select,
  MenuItem,
  Stack,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Checkbox,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { zhCN } from 'date-fns/locale';
import { X, Star, Target, TrendingUp, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task } from '../types';
import { triggerConfetti } from '../utils/confetti';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingTask?: Task | null;
  defaultType?: 'task' | 'habit'; // 默认类型，由父组件决定
}

export const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onClose, editingTask, defaultType = 'task' }) => {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: defaultType,
    priority: 'medium' as 'low' | 'medium' | 'high',
    deadline: null as Date | null,
    isStarred: false,
  });

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title || '',
        description: editingTask.description || '',
        type: editingTask.type || defaultType,
        priority: editingTask.priority || 'medium',
        deadline: editingTask.deadline ? new Date(editingTask.deadline) : null,
        isStarred: editingTask.isStarred || false,
      });
    } else {
      resetForm();
    }
  }, [editingTask, isOpen, defaultType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert(formData.type === 'habit' ? '请输入习惯标题' : '请输入任务标题');
      return;
    }

    const taskData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      type: formData.type,
      priority: formData.priority,
      category: 'personal',
      deadline: formData.deadline || undefined,
      tags: [],
      isStarred: formData.isStarred,
      completed: false,
      isArchived: false,
    };

    if (editingTask) {
      dispatch({
        type: 'UPDATE_TASK',
        payload: { id: editingTask.id, updates: taskData }
      });
    } else {
      dispatch({ type: 'ADD_TASK', payload: taskData });
    }

    onClose();
    resetForm();

    // 如果是新建任务/习惯，在对话框关闭后触发礼炮效果
    if (!editingTask) {
      setTimeout(() => {
        console.log('🎉 触发礼炮动画');
        triggerConfetti();
      }, 300);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: defaultType,
      priority: 'medium',
      deadline: null,
      isStarred: false,
    });
  };

  const handleClose = () => {
    onClose();
    if (!editingTask) {
      resetForm();
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {editingTask
          ? (formData.type === 'habit' ? '编辑习惯' : '编辑任务')
          : (formData.type === 'habit' ? '添加新习惯' : '添加新任务')
        }
        <IconButton onClick={handleClose} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhCN}>
            <Stack spacing={3}>
              {/* Title */}
              <TextField
                label="标题"
                required
                fullWidth
                autoFocus
                placeholder={formData.type === 'habit' ? '例如：每天阅读30分钟' : '例如：完成项目报告'}
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />

              {/* Description */}
              <TextField
                label="描述"
                fullWidth
                multiline
                rows={3}
                placeholder="添加更多详细信息..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />

              {/* Priority */}
              <FormControl fullWidth>
                <FormLabel>优先级</FormLabel>
                <RadioGroup
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                  row
                  sx={{ mt: 1 }}
                >
                  <FormControlLabel value="low" control={<Radio />} label="低" />
                  <FormControlLabel value="medium" control={<Radio />} label="中" />
                  <FormControlLabel value="high" control={<Radio />} label="高" />
                </RadioGroup>
              </FormControl>

              {/* Deadline (only for tasks) */}
              {formData.type === 'task' && (
                <FormControl fullWidth>
                  <FormLabel>截止时间</FormLabel>
                  <DateTimePicker
                    value={formData.deadline}
                    onChange={(newValue: Date | null) => setFormData(prev => ({ ...prev, deadline: newValue }))}
                    format="yyyy-MM-dd HH:mm:ss"
                    ampm={false}
                    views={['year', 'month', 'day', 'hours', 'minutes', 'seconds']}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        sx: { mt: 1 },
                        placeholder: '请选择截止日期和时间（精确到秒）',
                      },
                    }}
                  />
                </FormControl>
              )}

              {/* Star */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isStarred}
                    onChange={(e) => setFormData(prev => ({ ...prev, isStarred: e.target.checked }))}
                    icon={<Star size={20} />}
                    checkedIcon={<Star size={20} fill="currentColor" />}
                  />
                }
                label="标记为重要"
              />
            </Stack>
          </LocalizationProvider>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>
            取消
          </Button>
          <Button type="submit" variant="contained" startIcon={<Save size={16} />}>
            {editingTask
              ? '保存更改'
              : (formData.type === 'habit' ? '创建习惯' : '创建任务')
            }
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
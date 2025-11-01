import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import { AlertTriangle, Trash2, ArchiveRestore } from 'lucide-react';

// 确认对话框属性接口
interface ConfirmDialogProps {
  open: boolean; // 是否打开对话框
  onClose: () => void; // 关闭回调
  onConfirm: () => void; // 确认回调
  title: string; // 标题
  description: string; // 描述
  confirmText?: string; // 确认按钮文本
  cancelText?: string; // 取消按钮文本
  confirmColor?: 'primary' | 'error' | 'warning'; // 确认按钮颜色
  icon?: React.ReactNode; // 图标
  severity?: 'error' | 'warning' | 'info'; // 严重程度
}

// 确认对话框组件
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open, // 是否打开
  onClose, // 关闭回调
  onConfirm, // 确认回调
  title, // 标题
  description, // 描述
  confirmText = '确认', // 确认文本
  cancelText = '取消', // 取消文本
  confirmColor = 'primary', // 确认颜色
  icon, // 图标
  severity = 'warning', // 严重程度
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: (theme) => theme.shadows[20],
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {icon || (
            severity === 'error' ? <Trash2 size={24} color="#d32f2f" /> :
            severity === 'warning' ? <AlertTriangle size={24} color="#f57c00" /> :
            <ArchiveRestore size={24} color="#1976d2" />
          )}
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          {description}
        </DialogContentText>

        <Alert severity={severity} sx={{ mt: 2 }}>
          {severity === 'error' && '此操作无法撤销，请谨慎操作。'}
          {severity === 'warning' && '此操作可能影响您的数据，请确认是否继续。'}
          {severity === 'info' && '请确认您的操作。'}
        </Alert>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ minWidth: 80 }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={confirmColor}
          sx={{ minWidth: 80 }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  AppBar,
  Toolbar,
  Paper,
  Stack,
  Chip,
  TextField,
  Button,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Palette } from 'lucide-react';
import { themeMetadata, themePalettes } from '../theme/themes';
import { useSettings } from '../hooks/useStorage';
import { useApp } from '../context/AppContext';
import { SyncSettings } from '../electron';

type ThemeColorKey = keyof typeof themePalettes;

interface SettingsPageProps {
  darkMode: boolean;
  onThemeToggle: () => void;
  themeColor: ThemeColorKey;
  onThemeColorChange: (color: ThemeColorKey) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  darkMode,
  onThemeToggle,
  themeColor,
  onThemeColorChange,
}) => {
  
  const { settings: syncSettings, updateSettings: updateSyncSettings, reload: reloadSync } = useSettings<SyncSettings>('sync');
  const { dispatch } = useApp();
  const [webdavUrl, setWebdavUrl] = useState('');
  const [webdavUsername, setWebdavUsername] = useState('');
  const [webdavPassword, setWebdavPassword] = useState('');
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [autoSync, setAutoSync] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => {
    if (syncSettings) {
      setSyncEnabled(!!syncSettings.enabled);
      setAutoSync(!!syncSettings.autoSync);
      const w = syncSettings.webdav || { url: '', username: '', password: '' };
      setWebdavUrl(w.url || '');
      setWebdavUsername(w.username || '');
      setWebdavPassword(w.password || '');
    }
  }, [syncSettings]);

  const saveWebdavSettings = async () => {
    await updateSyncSettings({
      provider: 'webdav',
      enabled: syncEnabled,
      autoSync,
      webdav: {
        url: webdavUrl,
        username: webdavUsername,
        password: webdavPassword,
      },
    });
    await reloadSync();
    setActionMsg('已保存 WebDAV 设置');
  };

    const testConnection = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      const res = await window.electron.storage.webdavTestConnection();
      if (res.success) {
        setTestResult('连接成功');
      } else {
        setTestResult('连接失败');
      }
    } catch (err) {
      setTestResult('连接失败');
    } finally {
      setTesting(false);
    }
  };

    const uploadBackup = async () => {
    const res = await window.electron.storage.webdavUploadBackup();
    if (res.success) {
      setActionMsg('上传成功');
    } else {
      setActionMsg('上传失败');
    }
  };

    const downloadBackup = async () => {
    const res = await window.electron.storage.webdavDownloadBackup();
    if (res.success) {
      try {
        const [tasks, categories] = await Promise.all([
          window.electron.storage.getTasks(),
          window.electron.storage.getCategories(),
        ]);
        dispatch({ type: 'LOAD_TASKS', payload: tasks });
        dispatch({ type: 'LOAD_CATEGORIES', payload: categories });
        setActionMsg('已从 WebDAV 恢复数据，并刷新任务列表');
      } catch (e) {
        console.error('刷新任务与分类失败', e);
        setActionMsg('已从 WebDAV 恢复数据，但刷新列表失败');
      }
    } else {
      setActionMsg('恢复失败');
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ px: { xs: 2, md: 4 }, py: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              设置
            </Typography>
            <Typography variant="body2" color="text.secondary">
              个性化你的 Deadliner 体验
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Settings Content */}
      <Box sx={{ flex: 1, overflow: 'auto', px: { xs: 2, md: 4 }, py: 4 }}>
        <Grid container spacing={3}>
          {/* 主题颜色选择 */}
          <Grid size={{ xs: 12 }}>
            <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Palette size={24} style={{ marginRight: 12 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      主题配色
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      选择你喜欢的配色方案
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={2}>
                  {Object.entries(themeMetadata).map(([key, meta]) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={key}>
                      <Paper
                        elevation={themeColor === key ? 4 : 0}
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          border: 2,
                          borderColor: themeColor === key ? 'primary.main' : 'divider',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: 'primary.main',
                            transform: 'translateY(-4px)',
                            boxShadow: 4,
                          },
                        }}
                        onClick={() => onThemeColorChange(key as ThemeColorKey)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography sx={{ fontSize: '2rem', mr: 1.5 }}>
                            {meta.icon}
                          </Typography>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {meta.name}
                            </Typography>
                            {themeColor === key && (
                              <Chip
                                label="当前"
                                size="small"
                                color="primary"
                                sx={{ height: 20, fontSize: '0.65rem' }}
                              />
                            )}
                          </Box>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {meta.description}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* 应用信息 */}
          <Grid size={{ xs: 12 }}>
            <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  关于 Deadliner
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">版本</Typography>
                    <Typography variant="body2">1.0.0</Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">平台</Typography>
                    <Typography variant="body2">Windows</Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">作者</Typography>
                    <Typography variant="body2">Haomin Chen & Atrix Zhou</Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">项目地址</Typography>
                    <Typography
                      variant="body2"
                      component="a"
                      href="https://github.com/XiaoChennnng/Deadliner-Client"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: 'primary.main',
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      https://github.com/XiaoChennnng/Deadliner-Client
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* 同步设置（WebDAV）*/}
          <Grid size={{ xs: 12 }}>
            <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    同步设置（WebDAV）
                  </Typography>
                </Box>

                <Stack spacing={2}>
                  <FormControlLabel
                    control={<Switch checked={syncEnabled} onChange={(e) => setSyncEnabled(e.target.checked)} />}
                    label="启用同步"
                  />
                  <FormControlLabel
                    control={<Switch checked={autoSync} onChange={(e) => setAutoSync(e.target.checked)} />}
                    label="自动同步"
                  />

                  <TextField
                    label="WebDAV 地址"
                    placeholder="例如：https://example.com/remote.php/dav/files/username"
                    value={webdavUrl}
                    onChange={(e) => setWebdavUrl(e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="用户名"
                    value={webdavUsername}
                    onChange={(e) => setWebdavUsername(e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="密码"
                    type="password"
                    value={webdavPassword}
                    onChange={(e) => setWebdavPassword(e.target.value)}
                    fullWidth
                  />

                  <Stack direction="row" spacing={2}>
                    <Button variant="contained" onClick={saveWebdavSettings}>保存设置</Button>
                    <Button variant="outlined" onClick={testConnection} disabled={testing}>
                      {testing ? '测试中…' : '测试连接'}
                    </Button>
                    <Button variant="contained" color="primary" onClick={uploadBackup}>上传备份</Button>
                    <Button variant="contained" color="secondary" onClick={downloadBackup}>恢复备份</Button>
                  </Stack>

                  {testResult && (
                    <Typography variant="body2" color={testResult.startsWith('连接成功') ? 'success.main' : 'error.main'}>
                      {testResult}
                    </Typography>
                  )}
                  {actionMsg && (
                    <Typography variant="body2" color="text.secondary">
                      {actionMsg}
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

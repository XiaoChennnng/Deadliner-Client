import React from 'react';
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
} from '@mui/material';
import { Palette } from 'lucide-react';
import { themeMetadata } from '../theme/themes';

interface SettingsPageProps {
  darkMode: boolean;
  onThemeToggle: () => void;
  themeColor: string;
  onThemeColorChange: (color: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  darkMode,
  onThemeToggle,
  themeColor,
  onThemeColorChange,
}) => {

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
                        onClick={() => onThemeColorChange(key)}
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
        </Grid>
      </Box>
    </Box>
  );
};

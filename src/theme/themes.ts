import { createTheme, ThemeOptions, PaletteOptions } from '@mui/material/styles';

// 共享的主题配置
const sharedThemeOptions: ThemeOptions = {
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    h1: { fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2 },
    h2: { fontSize: '2rem', fontWeight: 600, lineHeight: 1.3 },
    h3: { fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.4 },
    h4: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.4 },
    h5: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.5 },
    h6: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.5 },
    body1: { fontSize: '1rem', lineHeight: 1.5 },
    body2: { fontSize: '0.875rem', lineHeight: 1.43 },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          padding: '10px 24px',
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        contained: {
          '&:hover': { boxShadow: '0 1px 2px rgba(0,0,0,0.1)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
          transition: 'box-shadow 0.3s ease-in-out, transform 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 6px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 500 },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { borderRight: 'none' },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0 3px 5px rgba(0,0,0,0.2)',
          '&:hover': { boxShadow: '0 6px 10px rgba(0,0,0,0.3)' },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 4, height: 6 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
        elevation1: { boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)' },
        elevation2: { boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)' },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          marginBottom: 4,
          '&.Mui-selected': { borderRadius: 12 },
        },
      },
    },
  },
};

// 主题调色板定义
export const themePalettes = {
  // 1. Material Design 3 (默认紫色)
  purple: {
    light: {
      primary: { main: '#6750A4', light: '#7965AF', dark: '#4F3D8E', contrastText: '#FFFFFF' },
      secondary: { main: '#625B71', light: '#7C75A0', dark: '#4A4458', contrastText: '#FFFFFF' },
      error: { main: '#B3261E', light: '#DC3630', dark: '#8C1D18', contrastText: '#FFFFFF' },
      warning: { main: '#F59E0B', light: '#FFA726', dark: '#FB8C00', contrastText: '#000000' },
      info: { main: '#2196F3', light: '#64B5F6', dark: '#1976D2', contrastText: '#FFFFFF' },
      success: { main: '#10B981', light: '#4ADE80', dark: '#059669', contrastText: '#FFFFFF' },
      background: { default: '#FEF7FF', paper: '#FFFFFF' },
      text: { primary: 'rgba(0, 0, 0, 0.87)', secondary: 'rgba(0, 0, 0, 0.60)', disabled: 'rgba(0, 0, 0, 0.38)' },
    },
    dark: {
      primary: { main: '#D0BCFF', light: '#E8DEF8', dark: '#8B7CB7', contrastText: '#381E72' },
      secondary: { main: '#CCC2DC', light: '#E8DEF8', dark: '#9A89B5', contrastText: '#332D41' },
      error: { main: '#F2B8B5', light: '#F9DEDC', dark: '#B3261E', contrastText: '#601410' },
      warning: { main: '#FCD34D', light: '#FEF3C7', dark: '#F59E0B', contrastText: '#000000' },
      info: { main: '#90CAF9', light: '#E3F2FD', dark: '#42A5F5', contrastText: '#000000' },
      success: { main: '#6EE7B7', light: '#D1FAE5', dark: '#10B981', contrastText: '#000000' },
      background: { default: '#1C1B1F', paper: '#211F26' },
      text: { primary: '#E6E1E5', secondary: 'rgba(230, 225, 229, 0.60)', disabled: 'rgba(230, 225, 229, 0.38)' },
    },
  },

  // 2. Ocean Blue (海洋蓝)
  ocean: {
    light: {
      primary: { main: '#0288D1', light: '#03A9F4', dark: '#01579B', contrastText: '#FFFFFF' },
      secondary: { main: '#00ACC1', light: '#00BCD4', dark: '#006064', contrastText: '#FFFFFF' },
      error: { main: '#D32F2F', light: '#EF5350', dark: '#C62828', contrastText: '#FFFFFF' },
      warning: { main: '#F57C00', light: '#FF9800', dark: '#E65100', contrastText: '#FFFFFF' },
      info: { main: '#0288D1', light: '#03A9F4', dark: '#01579B', contrastText: '#FFFFFF' },
      success: { main: '#00897B', light: '#26A69A', dark: '#00695C', contrastText: '#FFFFFF' },
      background: { default: '#E1F5FE', paper: '#FFFFFF' },
      text: { primary: 'rgba(0, 0, 0, 0.87)', secondary: 'rgba(0, 0, 0, 0.60)', disabled: 'rgba(0, 0, 0, 0.38)' },
    },
    dark: {
      primary: { main: '#4FC3F7', light: '#81D4FA', dark: '#0288D1', contrastText: '#000000' },
      secondary: { main: '#4DD0E1', light: '#80DEEA', dark: '#00ACC1', contrastText: '#000000' },
      error: { main: '#EF5350', light: '#E57373', dark: '#D32F2F', contrastText: '#FFFFFF' },
      warning: { main: '#FFB74D', light: '#FFD54F', dark: '#F57C00', contrastText: '#000000' },
      info: { main: '#4FC3F7', light: '#81D4FA', dark: '#0288D1', contrastText: '#000000' },
      success: { main: '#4DB6AC', light: '#80CBC4', dark: '#00897B', contrastText: '#000000' },
      background: { default: '#0A1929', paper: '#132F4C' },
      text: { primary: '#E3F2FD', secondary: 'rgba(227, 242, 253, 0.60)', disabled: 'rgba(227, 242, 253, 0.38)' },
    },
  },

  // 3. Forest Green (森林绿)
  forest: {
    light: {
      primary: { main: '#388E3C', light: '#4CAF50', dark: '#1B5E20', contrastText: '#FFFFFF' },
      secondary: { main: '#689F38', light: '#8BC34A', dark: '#33691E', contrastText: '#FFFFFF' },
      error: { main: '#D32F2F', light: '#EF5350', dark: '#C62828', contrastText: '#FFFFFF' },
      warning: { main: '#F57C00', light: '#FF9800', dark: '#E65100', contrastText: '#FFFFFF' },
      info: { main: '#0288D1', light: '#03A9F4', dark: '#01579B', contrastText: '#FFFFFF' },
      success: { main: '#388E3C', light: '#4CAF50', dark: '#1B5E20', contrastText: '#FFFFFF' },
      background: { default: '#F1F8E9', paper: '#FFFFFF' },
      text: { primary: 'rgba(0, 0, 0, 0.87)', secondary: 'rgba(0, 0, 0, 0.60)', disabled: 'rgba(0, 0, 0, 0.38)' },
    },
    dark: {
      primary: { main: '#66BB6A', light: '#81C784', dark: '#388E3C', contrastText: '#000000' },
      secondary: { main: '#9CCC65', light: '#AED581', dark: '#689F38', contrastText: '#000000' },
      error: { main: '#EF5350', light: '#E57373', dark: '#D32F2F', contrastText: '#FFFFFF' },
      warning: { main: '#FFB74D', light: '#FFD54F', dark: '#F57C00', contrastText: '#000000' },
      info: { main: '#4FC3F7', light: '#81D4FA', dark: '#0288D1', contrastText: '#000000' },
      success: { main: '#66BB6A', light: '#81C784', dark: '#388E3C', contrastText: '#000000' },
      background: { default: '#1A1F1A', paper: '#232823' },
      text: { primary: '#E8F5E9', secondary: 'rgba(232, 245, 233, 0.60)', disabled: 'rgba(232, 245, 233, 0.38)' },
    },
  },

  // 4. Sunset Orange (日落橙)
  sunset: {
    light: {
      primary: { main: '#FF5722', light: '#FF7043', dark: '#D84315', contrastText: '#FFFFFF' },
      secondary: { main: '#FF9800', light: '#FFB74D', dark: '#F57C00', contrastText: '#000000' },
      error: { main: '#D32F2F', light: '#EF5350', dark: '#C62828', contrastText: '#FFFFFF' },
      warning: { main: '#FF9800', light: '#FFB74D', dark: '#F57C00', contrastText: '#000000' },
      info: { main: '#2196F3', light: '#64B5F6', dark: '#1976D2', contrastText: '#FFFFFF' },
      success: { main: '#4CAF50', light: '#66BB6A', dark: '#388E3C', contrastText: '#FFFFFF' },
      background: { default: '#FFF3E0', paper: '#FFFFFF' },
      text: { primary: 'rgba(0, 0, 0, 0.87)', secondary: 'rgba(0, 0, 0, 0.60)', disabled: 'rgba(0, 0, 0, 0.38)' },
    },
    dark: {
      primary: { main: '#FF8A65', light: '#FFAB91', dark: '#FF5722', contrastText: '#000000' },
      secondary: { main: '#FFB74D', light: '#FFD54F', dark: '#FF9800', contrastText: '#000000' },
      error: { main: '#EF5350', light: '#E57373', dark: '#D32F2F', contrastText: '#FFFFFF' },
      warning: { main: '#FFB74D', light: '#FFD54F', dark: '#F57C00', contrastText: '#000000' },
      info: { main: '#64B5F6', light: '#90CAF9', dark: '#2196F3', contrastText: '#000000' },
      success: { main: '#66BB6A', light: '#81C784', dark: '#4CAF50', contrastText: '#000000' },
      background: { default: '#1F1410', paper: '#2A1A14' },
      text: { primary: '#FFE0B2', secondary: 'rgba(255, 224, 178, 0.60)', disabled: 'rgba(255, 224, 178, 0.38)' },
    },
  },

  // 5. Rose Pink (玫瑰粉)
  rose: {
    light: {
      primary: { main: '#E91E63', light: '#EC407A', dark: '#AD1457', contrastText: '#FFFFFF' },
      secondary: { main: '#F06292', light: '#F48FB1', dark: '#C2185B', contrastText: '#FFFFFF' },
      error: { main: '#D32F2F', light: '#EF5350', dark: '#C62828', contrastText: '#FFFFFF' },
      warning: { main: '#FF9800', light: '#FFB74D', dark: '#F57C00', contrastText: '#000000' },
      info: { main: '#2196F3', light: '#64B5F6', dark: '#1976D2', contrastText: '#FFFFFF' },
      success: { main: '#4CAF50', light: '#66BB6A', dark: '#388E3C', contrastText: '#FFFFFF' },
      background: { default: '#FCE4EC', paper: '#FFFFFF' },
      text: { primary: 'rgba(0, 0, 0, 0.87)', secondary: 'rgba(0, 0, 0, 0.60)', disabled: 'rgba(0, 0, 0, 0.38)' },
    },
    dark: {
      primary: { main: '#F48FB1', light: '#F8BBD0', dark: '#E91E63', contrastText: '#000000' },
      secondary: { main: '#F8BBD0', light: '#FCE4EC', dark: '#F06292', contrastText: '#000000' },
      error: { main: '#EF5350', light: '#E57373', dark: '#D32F2F', contrastText: '#FFFFFF' },
      warning: { main: '#FFB74D', light: '#FFD54F', dark: '#F57C00', contrastText: '#000000' },
      info: { main: '#64B5F6', light: '#90CAF9', dark: '#2196F3', contrastText: '#000000' },
      success: { main: '#66BB6A', light: '#81C784', dark: '#4CAF50', contrastText: '#000000' },
      background: { default: '#1F1418', paper: '#2A1822' },
      text: { primary: '#FCE4EC', secondary: 'rgba(252, 228, 236, 0.60)', disabled: 'rgba(252, 228, 236, 0.38)' },
    },
  },
};

// 主题元数据
export const themeMetadata = {
  purple: { name: 'Material 紫', icon: '🟣', description: 'Material Design 3 风格' },
  ocean: { name: '海洋蓝', icon: '🌊', description: '清新的海洋蓝色调' },
  forest: { name: '森林绿', icon: '🌲', description: '自然的森林绿色调' },
  sunset: { name: '日落橙', icon: '🌅', description: '温暖的日落橙色调' },
  rose: { name: '玫瑰粉', icon: '🌹', description: '优雅的玫瑰粉色调' },
};

// 创建主题
export const createAppTheme = (themeColor: keyof typeof themePalettes, mode: 'light' | 'dark') => {
  const palette = themePalettes[themeColor][mode];
  return createTheme({
    ...sharedThemeOptions,
    palette: {
      mode,
      ...palette,
    } as PaletteOptions,
  });
};

// 导出默认主题（保持向后兼容）
export const lightTheme = createAppTheme('purple', 'light');
export const darkTheme = createAppTheme('purple', 'dark');

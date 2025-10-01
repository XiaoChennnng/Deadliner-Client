# Deadliner-Client
一个简洁高效Deadline管理记录软件，客户端受AritxOnly委托开发，
原仓库地址：https://github.com/AritxOnly/Deadliner

# 功能
- 添加、编辑、删除：管理任务（Task）和习惯（Habit）项目
- 分类展示：按类型区分截止与习惯
- 筛选与搜索：按名称、开始时间或已过时间筛选
- 概览视图：显示即将到期的截止并倒计时
- 存档视图：查看已归档的项目
- 应用内更新检查：从 GitHub 拉取最新发布信息并提示下载／安装
- 自定义界面：浅色／深色模式、主题配色、动画效果

# 技术栈
### 前端框架
- React 19.1.1 - 主要的前端框架
- TypeScript 4.9.5 - 类型安全的JavaScript超集
- React Router DOM 7.9.2 - 路由管理
### UI 组件库
- Material-UI (MUI) 7.3.2 - 主要的UI组件库
  - @mui/material - 核心组件
  - @mui/icons-material - 图标库
  - @mui/x-date-pickers - 日期选择器
- Emotion - CSS-in-JS样式库
- Lucide React - 图标库
- @iconify/react - 图标库
### 桌面应用
- Electron 38.2.0 - 将Web应用打包为桌面应用
- Electron Builder - 构建和打包工具
### 数据存储
- Better SQLite3 - 本地数据库
- Electron Store - 应用配置存储


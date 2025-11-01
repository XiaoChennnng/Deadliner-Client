# Deadliner-Client
一个简洁高效Deadline管理记录软件，客户端受AritxOnly委托开发，
原仓库地址：https://github.com/AritxOnly/Deadliner

## 功能
- 添加、编辑、删除：管理任务（Task）和习惯（Habit）项目
- 分类展示：按类型区分截止与习惯
- 筛选与搜索：按名称、开始时间或已过时间筛选
- 概览视图：显示即将到期的截止并倒计时
- 存档视图：查看已归档的项目
- 应用内更新检查：从 GitHub 拉取最新发布信息并提示下载／安装
- 自定义界面：浅色／深色模式、主题配色、动画效果

## 技术栈
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

## 安装
   ```bash
   git clone https://github.com/XiaoChennnng/Deadliner-Client.git
   ```
## WebDAV 同步（可选）
- 支持将应用数据（任务、习惯、分类、设置备份）上传到 WebDAV 并从远端恢复。
- 不改变本地数据库逻辑；同步为手动操作，默认路径为 `/Deadliner/backup.json`。

### 配置步骤
- 打开应用的 `设置` 页面，找到“同步设置（WebDAV）”。
- 启用同步并填写 `WebDAV 地址`、`用户名`、`密码`。
  - 地址示例：`https://example.com/remote.php/dav/files/username`
- 点击“保存设置”，然后“测试连接”验证凭据可用。

### 使用说明
- “上传备份”会将当前导出的 JSON 备份上传到 WebDAV 的 `/Deadliner/backup.json`。
- “恢复备份”会从该路径下载备份并导入，覆盖当前数据。
- 默认会在 WebDAV 端创建 `/Deadliner` 文件夹（若不存在）。

### 安全与风险提示
- 密码通过 Electron 的安全存储（`electron-store`）保存，不会写入普通设置文件。
- WebDAV 凭据与远端地址由你自行管理，请确保可信的服务端与网络环境。
- 恢复备份将覆盖当前数据，建议在恢复前做好本地备份。

### 常见问题
- 提示“未选择 WebDAV 作为同步提供者”：请在设置中选择并保存为 WebDAV。
- 连接失败：检查地址、用户名、密码是否正确，或服务端是否支持 WebDAV。

## 贡献
欢迎任何形式的贡献！请提交 Issue 或 Pull Request，以改进功能或修复 Bug。

## 许可证
本项目基于 MIT 许可证，详情请参见 [LICENSE](LICENSE)。



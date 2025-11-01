import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Stack,
  Alert,
  LinearProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  Divider,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { zhCN } from 'date-fns/locale';
import {
  Sparkles,
  Settings,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  HelpCircle,
  Clock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { triggerConfetti } from '../utils/confetti';
import {
  AI_PROVIDERS,
  AIProviderId,
  callAIAPI,
  AuthManager,
  RateLimiter,
  QuotaManager,
  type AIProvider
} from '../utils/aiApi';

// AI 生成的任务接口
interface GeneratedTask {
  title: string; // 任务标题
  description: string; // 任务描述
  priority: 'high' | 'medium' | 'low'; // 优先级
  deadline?: Date; // 截止时间
  type?: 'task' | 'habit' | 'unknown'; // 任务类型，包含未知类型
}



// 缺失信息接口
interface MissingInfo {
  missingFields: string[]; // 缺失的字段：time, goal, detail, priority, type 等
  reason: string; // AI 给出的缺失原因
}

// AI 智能生成页面组件
export const AIGenerationPage: React.FC = () => {
  // 获取应用上下文的 dispatch 函数
  const { dispatch } = useApp();
  // 用户输入的提示文本
  const [prompt, setPrompt] = useState('');
  // 加载状态
  const [loading, setLoading] = useState(false);
  // 错误信息
  const [error, setError] = useState<string | null>(null);
  // 生成的任务列表
  const [generatedTasks, setGeneratedTasks] = useState<GeneratedTask[]>([]);
  // 设置对话框开关
  const [settingsOpen, setSettingsOpen] = useState(false);
  // 引导对话框开关
  const [guidedDialogOpen, setGuidedDialogOpen] = useState(false);
  // 缺失信息
  const [missingInfo, setMissingInfo] = useState<MissingInfo | null>(null);
  // 原始提示文本
  const [originalPrompt, setOriginalPrompt] = useState('');
  // 类型选择对话框开关
  const [typeSelectDialogOpen, setTypeSelectDialogOpen] = useState(false);
  // 要添加的任务
  const [taskToAdd, setTaskToAdd] = useState<GeneratedTask | null>(null);

  // 补充信息的表单状态
  const [supplementForm, setSupplementForm] = useState({
    deadline: null as Date | null, // 截止时间
    detailedGoal: '', // 详细目标
    priority: 'medium', // 优先级
    additionalInfo: '', // 补充信息
    type: '' as '' | 'task' | 'habit', // 任务类型
  });

  // 选中的 AI 提供商
  const [selectedProvider, setSelectedProvider] = useState<AIProviderId>(
    (localStorage.getItem('ai_selected_provider') as AIProviderId) || 'deepseek'
  );
  // 提供商配置
  const [providerConfigs, setProviderConfigs] = useState<Record<AIProviderId, { apiKey: string; baseUrl: string }>>(() => {
    const configs: Record<AIProviderId, { apiKey: string; baseUrl: string }> = {} as any;
    Object.keys(AI_PROVIDERS).forEach(providerId => {
      const id = providerId as AIProviderId;
      configs[id] = {
        apiKey: localStorage.getItem(`ai_api_key_${id}`) || '', // API 密钥
        baseUrl: localStorage.getItem(`ai_base_url_${id}`) || AI_PROVIDERS[id].baseUrl, // 基础 URL
      };
    });
    return configs;
  });

  // 保存设置
  const saveSettings = () => {
    const config = providerConfigs[selectedProvider];
    if (!config.apiKey.trim()) {
      setError('请输入 API Key');
      return;
    }

    localStorage.setItem('ai_selected_provider', selectedProvider);
    localStorage.setItem(`ai_api_key_${selectedProvider}`, config.apiKey);
    localStorage.setItem(`ai_base_url_${selectedProvider}`, config.baseUrl);

    // 更新认证管理器
    const authManager = AuthManager.getInstance();
    authManager.setAuth(selectedProvider, config.apiKey, config.baseUrl);

    setSettingsOpen(false);
    setError(null);
  };

  // 重置补充表单
  const resetSupplementForm = () => {
    setSupplementForm({
      deadline: null,
      detailedGoal: '',
      priority: 'medium',
      additionalInfo: '',
      type: '',
    });
    setMissingInfo(null);
    setOriginalPrompt('');
  };

  // 检查提示文本的清晰度
  const checkPromptClarity = async (text: string): Promise<MissingInfo | null> => {
    const config = providerConfigs[selectedProvider];
    if (!config.apiKey) return null;

    const provider: AIProvider = {
      ...AI_PROVIDERS[selectedProvider],
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
    };

    // 检查限流
    const rateLimiter = RateLimiter.getInstance();
    if (!rateLimiter.canMakeRequest(selectedProvider)) {
      setError('请求过于频繁，请稍后再试');
      return null;
    }

    try {
      const response = await callAIAPI(provider, [
        {
          role: 'system',
          content: `你是一个需求分析助手。判断用户的需求描述是否明确，并识别缺失的信息。

如果需求明确，返回：{"isClear": true}

如果需求不明确，返回：
{
  "isClear": false,
  "missingFields": ["time", "goal", "detail", "priority", "type"],
  "reason": "缺少具体的时间范围和详细目标描述"
}

missingFields 可能的值：
- "time": 缺少时间范围或截止时间
- "goal": 目标不够具体
- "detail": 缺少详细描述或执行步骤
- "priority": 无法判断优先级
- "type": 无法判断是任务还是习惯

只返回 JSON，不要其他文字。`
        },
        { role: 'user', content: text },
      ], { temperature: 0.3 });

      if (!response.success || !response.content) {
        return null; // API 调用失败，默认认为明确
      }

      const content = response.content.trim();

      // 清理可能的代码块标记
      let cleanContent = content;
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/```json\s*/, '').replace(/```\s*$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/```\s*/, '').replace(/```\s*$/, '');
      }

      const result = JSON.parse(cleanContent);

      if (result.isClear) {
        return null; // 需求明确
      } else {
        return {
          missingFields: result.missingFields || [],
          reason: result.reason || '需求描述不够明确',
        };
      }
    } catch (err) {
      console.error('Clarity check error:', err);
      return null; // 出错时默认认为明确
    }
  };

  // 生成任务
  const generateTasks = async () => {
    const config = providerConfigs[selectedProvider];
    if (!config.apiKey) {
      setError(`请先配置 ${AI_PROVIDERS[selectedProvider].name} API Key`);
      setSettingsOpen(true);
      return;
    }

    if (!prompt.trim()) {
      setError('请输入您的需求描述');
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedTasks([]);

    // 先检查需求是否明确
    const missing = await checkPromptClarity(prompt);
    if (missing) {
      setLoading(false);
      setMissingInfo(missing);
      setOriginalPrompt(prompt);
      setGuidedDialogOpen(true);
      setError(`需求不够明确：${missing.reason}`);
      return;
    }

    await generateTaskWithAI(prompt);
  };

  // 使用 AI 生成任务
  const generateTaskWithAI = async (userPrompt: string) => {
    const config = providerConfigs[selectedProvider];
    if (!config.apiKey) {
      setError('请先配置 API Key');
      setSettingsOpen(true);
      return;
    }

    // 检查限流
    const rateLimiter = RateLimiter.getInstance();
    if (!rateLimiter.canMakeRequest(selectedProvider)) {
      setError('请求过于频繁，请稍后再试');
      return;
    }

    // 检查配额
    const quotaManager = QuotaManager.getInstance();
    if (!quotaManager.canUseQuota(selectedProvider)) {
      setError('已达到 API 使用配额限制');
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedTasks([]);

    try {
      const provider: AIProvider = {
        ...AI_PROVIDERS[selectedProvider],
        apiKey: config.apiKey,
        baseUrl: config.baseUrl,
      };

      // 获取当前时区、日期、语言信息
      const now = new Date();
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const locale = navigator.language || 'zh-CN';
      const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const currentDateTime = now.toLocaleString('sv-SE', { timeZone }).replace(' ', 'T').substring(0, 16); // YYYY-MM-DD HH:mm

      const systemPrompt = `你是Deadliner AI，一个任务管理助手。用户会输入一段自然语言文本，请你从中提取任务，并以**纯 JSON**返回，结构如下：
{
  "title": "任务名称（≤30字符）",
  "description": "详细描述（包含执行步骤和子任务）",
  "priority": "优先级 (high/medium/low)",
  "deadline": "截止日期时间，格式 YYYY-MM-DD HH:mm:ss",
  "type": "任务类型 (task/habit)"
}

规则要求：
1) 仅返回 JSON，**不要**额外说明、代码块（\`\`\`）、尾逗号。
2) "title" 和 "description" 必须使用与设备语言一致的语言（当前语言：${locale}）。
3) "deadline" 必须严格用 YYYY-MM-DD HH:mm:ss（24小时制，零填充，精确到秒，不带时区）。
4) 如果出现"今天/明天/本周五/下周一/今晚"等相对时间，请基于设备时区 ${timeZone}、当前时间 ${currentDateTime} 推断，最终输出 YYYY-MM-DD HH:mm:ss。
5) 如果无法精确到秒，可保守推断（如"晚上"=20:00:00，"早上"=09:00:00，"中午"=12:00:00，"下午"=14:00:00），但**必须给出具体可解析的时间**。
6) JSON 键固定为 title/description/priority/deadline/type，不要新增或遗漏。
7) priority 根据任务紧急程度判断：紧急重要=high，一般=medium，不紧急=low。
8) description 中应包含具体的执行步骤，帮助用户明确如何完成任务。
9) type 判断规则：
   - 如果是需要持续、重复、养成的行为（如"每天跑步"、"坚持阅读"、"养成习惯"），设为 "habit"
   - 如果是一次性任务、项目、目标（如"完成报告"、"买东西"、"学习某技能"），设为 "task"
   - 如果无法明确判断，设为 "unknown"（系统会提示用户选择）`;

      const todayHint = `当前日期：${currentDate}；当前时间：${currentDateTime}；设备语言：${locale}；时区：${timeZone}。请严格按上述格式输出 JSON。`;

      const response = await callAIAPI(provider, [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: todayHint },
        { role: 'user', content: userPrompt },
      ], { temperature: 0.7 });

      if (!response.success || !response.content) {
        throw new Error(response.error || 'API 调用失败');
      }

      const content = response.content;

      // Parse JSON response - 现在只解析单个任务对象
      let task: GeneratedTask;
      try {
        // 清理可能的代码块标记
        let cleanContent = content.trim();
        if (cleanContent.startsWith('```json')) {
          cleanContent = cleanContent.replace(/```json\s*/, '').replace(/```\s*$/, '');
        } else if (cleanContent.startsWith('```')) {
          cleanContent = cleanContent.replace(/```\s*/, '').replace(/```\s*$/, '');
        }

        // 从响应中提取JSON
        const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          task = JSON.parse(jsonMatch[0]);
        } else {
          task = JSON.parse(cleanContent);
        }

        // 处理 deadline 字段：转换为 Date 对象
        if (task.deadline) {
          // 将 "YYYY-MM-DD HH:mm:ss" 格式转换为 Date 对象
          const deadlineStr = task.deadline.toString();
          if (deadlineStr.length === 19) { // YYYY-MM-DD HH:mm:ss
            task.deadline = new Date(deadlineStr.replace(' ', 'T'));
          } else if (deadlineStr.length === 16) { // YYYY-MM-DD HH:mm
            task.deadline = new Date(deadlineStr.replace(' ', 'T') + ':00');
          } else if (deadlineStr.length === 10) { // YYYY-MM-DD
            task.deadline = new Date(deadlineStr + 'T00:00:00');
          } else {
            task.deadline = new Date(deadlineStr);
          }
        }
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError, 'Content:', content);
        throw new Error('AI 返回格式错误，请重试');
      }

      setGeneratedTasks([task]); // 只设置一个任务
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成任务失败，请检查 API 配置');
      console.error('AI Generation Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 处理补充信息并重新生成
  const handleSupplementAndRegenerate = async () => {
    if (!missingInfo || !originalPrompt) return;

    // 检查如果缺少类型但用户未选择，提示用户
    if (missingInfo.missingFields.includes('type') && !supplementForm.type) {
      setError('请选择任务类型（任务或习惯）');
      return;
    }

    // 构建补充信息
    const supplementParts: string[] = [originalPrompt];

    if (supplementForm.type) {
      supplementParts.push(`类型：${supplementForm.type === 'task' ? '任务（一次性完成）' : '习惯（持续养成）'}`);
    }
    if (supplementForm.deadline) {
      const formattedDeadline = supplementForm.deadline.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      supplementParts.push(`截止时间：${formattedDeadline}`);
    }
    if (supplementForm.detailedGoal) {
      supplementParts.push(`详细目标：${supplementForm.detailedGoal}`);
    }
    if (supplementForm.additionalInfo) {
      supplementParts.push(`补充说明：${supplementForm.additionalInfo}`);
    }
    supplementParts.push(`优先级：${supplementForm.priority === 'high' ? '高' : supplementForm.priority === 'medium' ? '中' : '低'}`);

    const enhancedPrompt = supplementParts.join('\n');

    // 关闭对话框
    setGuidedDialogOpen(false);
    resetSupplementForm();

    // 使用补充后的完整信息生成任务
    await generateTaskWithAI(enhancedPrompt);
  };

  // 添加任务
  const addTask = (task: GeneratedTask) => {
    // 检查类型是否需要用户选择
    if (!task.type || task.type === 'unknown') {
      setTaskToAdd(task);
      setTypeSelectDialogOpen(true);
      return;
    }

    // 类型已明确，直接添加
    dispatch({
      type: 'ADD_TASK',
      payload: {
        title: task.title,
        description: task.description,
        type: task.type,
        priority: task.priority,
        category: 'uncategorized',
        tags: [],
        deadline: task.deadline,
        completed: false,
        isStarred: false,
        isArchived: false,
      },
    });

    // 触发礼炮效果
    setTimeout(() => {
      triggerConfetti();
    }, 100);

    // 从生成列表中移除
    setGeneratedTasks(tasks => tasks.filter(t => t !== task));
  };

  // 确认添加带类型的任务
  const confirmAddTaskWithType = (type: 'task' | 'habit') => {
    if (!taskToAdd) return;

    dispatch({
      type: 'ADD_TASK',
      payload: {
        title: taskToAdd.title,
        description: taskToAdd.description,
        type: type,
        priority: taskToAdd.priority,
        category: 'uncategorized',
        tags: [],
        deadline: taskToAdd.deadline,
        completed: false,
        isStarred: false,
        isArchived: false,
      },
    });

    // 触发礼炮效果
    setTimeout(() => {
      triggerConfetti();
    }, 100);

    // 从生成列表中移除
    setGeneratedTasks(tasks => tasks.filter(t => t !== taskToAdd));

    // 关闭对话框并重置
    setTypeSelectDialogOpen(false);
    setTaskToAdd(null);
  };



  // 移除任务
  const removeTask = (task: GeneratedTask) => {
    setGeneratedTasks(tasks => tasks.filter(t => t !== task));
  };

  // 获取优先级颜色
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  // 检查是否有 API 密钥
  const hasApiKey = !!providerConfigs[selectedProvider]?.apiKey;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <Box
        sx={{
          px: { xs: 2, md: 4 },
          py: 3,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            AI 智能规划
          </Typography>
          <Typography variant="body2" color="text.secondary">
            使用 {AI_PROVIDERS[selectedProvider].name} 智能分解任务和目标
          </Typography>
        </Box>
        <IconButton onClick={() => setSettingsOpen(true)} size="large">
          <Settings size={24} />
        </IconButton>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: 'auto', px: { xs: 2, md: 4 }, py: 3 }}>
        {!hasApiKey && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            请先配置 DeepSeek API Key 才能使用 AI 规划功能
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Input Section */}
        <Card elevation={2} sx={{ mb: 4 }}>
          <CardContent>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Lightbulb size={20} />
                  描述您的目标或需求
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  placeholder="例如：我想在三个月内学会 React 和 TypeScript，并能开发一个完整的 Web 应用..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={loading}
                  sx={{ mb: 2 }}
                />
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Sparkles size={20} />}
                    onClick={generateTasks}
                    disabled={loading || !hasApiKey}
                    sx={{ minWidth: 180 }}
                  >
                    {loading ? '生成中...' : 'AI 智能生成'}
                  </Button>
                </Stack>
              </Box>

              {loading && (
                <Box>
                  <LinearProgress />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                    AI 正在分析您的需求并生成任务计划...
                  </Typography>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Generated Tasks */}
        {generatedTasks.length > 0 && (
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle size={20} />
                AI 生成的任务
              </Typography>
              <List>
                {generatedTasks.map((task, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <Divider />}
                    <ListItem
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        py: 2,
                      }}
                    >
                      <Box sx={{ width: '100%', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6" sx={{ flex: 1 }}>
                            {task.title}
                          </Typography>
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<Plus size={16} />}
                              onClick={() => addTask(task)}
                            >
                              添加
                            </Button>
                            <IconButton size="small" onClick={() => removeTask(task)} color="error">
                              <Trash2 size={18} />
                            </IconButton>
                          </Stack>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                          {task.description}
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          <Chip
                            label={task.priority === 'high' ? '高优先级' : task.priority === 'medium' ? '中优先级' : '低优先级'}
                            size="small"
                            color={getPriorityColor(task.priority) as any}
                          />
                          {task.deadline && (
                            <Chip
                              icon={<Clock size={14} />}
                              label={`截止: ${new Date(task.deadline).toLocaleString('zh-CN', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: false,
                              })}`}
                              size="small"
                              variant="outlined"
                              color="info"
                            />
                          )}
                        </Stack>
                      </Box>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        )}

        {/* Tips Section */}
        {!loading && generatedTasks.length === 0 && hasApiKey && (
          <Card elevation={1} sx={{ bgcolor: 'info.50', borderColor: 'info.main', borderWidth: 1, borderStyle: 'solid' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Lightbulb size={20} />
                使用建议
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">
                  • 描述清晰的目标：例如 "学习前端开发"、"准备马拉松比赛"、"写一本小说"
                </Typography>
                <Typography variant="body2">
                  • 包含时间范围：例如 "在三个月内"、"本周完成"、"年度目标"
                </Typography>
                <Typography variant="body2">
                  • 提供具体要求：例如 "需要每天练习"、"分为基础和进阶两个阶段"
                </Typography>
                <Typography variant="body2">
                  • AI 会自动为每个任务设置优先级、分类和截止时间
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>AI API 配置</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>AI 提供商</InputLabel>
              <Select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value as AIProviderId)}
                label="AI 提供商"
              >
                {Object.entries(AI_PROVIDERS).map(([id, provider]) => (
                  <MenuItem key={id} value={id}>
                    {provider.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Alert severity="info" icon={<AlertCircle size={20} />}>
              {selectedProvider === 'deepseek' && (
                <>请访问 <a href="https://platform.deepseek.com" target="_blank" rel="noopener noreferrer">platform.deepseek.com</a> 申请 API Key</>
              )}
              {selectedProvider === 'claude' && (
                <>请访问 <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer">console.anthropic.com</a> 申请 API Key</>
              )}
              {(selectedProvider === 'gpt4' || selectedProvider === 'gpt35' || selectedProvider === 'gpt4turbo') && (
                <>请访问 <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer">platform.openai.com</a> 申请 API Key</>
              )}
              {selectedProvider === 'qwen' && (
                <>请访问 <a href="https://dashscope.aliyun.com" target="_blank" rel="noopener noreferrer">dashscope.aliyun.com</a> 申请 API Key</>
              )}
              {selectedProvider === 'kimi' && (
                <>请访问 <a href="https://platform.moonshot.cn" target="_blank" rel="noopener noreferrer">platform.moonshot.cn</a> 申请 API Key</>
              )}
            </Alert>

            <TextField
              label="API Key"
              fullWidth
              type="password"
              value={providerConfigs[selectedProvider]?.apiKey || ''}
              onChange={(e) => setProviderConfigs(prev => ({
                ...prev,
                [selectedProvider]: {
                  ...prev[selectedProvider],
                  apiKey: e.target.value
                }
              }))}
              placeholder="sk-..."
              helperText="您的 API Key 将存储在本地浏览器中"
            />

            <TextField
              label="Base URL"
              fullWidth
              value={providerConfigs[selectedProvider]?.baseUrl || ''}
              onChange={(e) => setProviderConfigs(prev => ({
                ...prev,
                [selectedProvider]: {
                  ...prev[selectedProvider],
                  baseUrl: e.target.value
                }
              }))}
              helperText={`默认: ${AI_PROVIDERS[selectedProvider].baseUrl}`}
            />

            <Alert severity="warning">
              注意：API Key 仅存储在您的浏览器本地，不会上传到任何服务器
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>取消</Button>
          <Button
            onClick={saveSettings}
            variant="contained"
            disabled={!providerConfigs[selectedProvider]?.apiKey}
          >
            保存配置
          </Button>
        </DialogActions>
      </Dialog>

      {/* Supplement Information Dialog */}
      <Dialog open={guidedDialogOpen} onClose={() => { setGuidedDialogOpen(false); resetSupplementForm(); }} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <HelpCircle size={24} />
            <Typography variant="h6">补充任务信息</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhCN}>
            <Stack spacing={3} sx={{ mt: 2 }}>
              {missingInfo && (
                <Alert severity="info" icon={<AlertCircle size={20} />}>
                  {missingInfo.reason}
                </Alert>
              )}

              {/* 原始需求 */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  您的原始需求：
                </Typography>
                <Typography variant="body2" sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                  {originalPrompt}
                </Typography>
              </Box>

              <Divider />

              {/* 根据缺失字段动态显示表单 */}
              {missingInfo?.missingFields.includes('time') && (
                <FormControl fullWidth>
                  <FormLabel>截止时间</FormLabel>
                  <DateTimePicker
                    value={supplementForm.deadline}
                    onChange={(newValue: Date | null) => setSupplementForm({...supplementForm, deadline: newValue})}
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

              {missingInfo?.missingFields.includes('goal') && (
                <FormControl fullWidth>
                  <FormLabel>详细目标描述</FormLabel>
                  <TextField
                    multiline
                    rows={3}
                    value={supplementForm.detailedGoal}
                    onChange={(e) => setSupplementForm({...supplementForm, detailedGoal: e.target.value})}
                    placeholder="请详细描述您想要达成的具体目标..."
                    sx={{ mt: 1 }}
                  />
                </FormControl>
              )}

              {missingInfo?.missingFields.includes('detail') && (
                <FormControl fullWidth>
                  <FormLabel>补充说明</FormLabel>
                  <TextField
                    multiline
                    rows={3}
                    value={supplementForm.additionalInfo}
                    onChange={(e) => setSupplementForm({...supplementForm, additionalInfo: e.target.value})}
                    placeholder="请补充更详细的信息或具体要求..."
                    sx={{ mt: 1 }}
                  />
                </FormControl>
              )}

              {missingInfo?.missingFields.includes('priority') && (
                <FormControl fullWidth>
                  <FormLabel>优先级</FormLabel>
                  <RadioGroup
                    value={supplementForm.priority}
                    onChange={(e) => setSupplementForm({...supplementForm, priority: e.target.value})}
                    row
                    sx={{ mt: 1 }}
                  >
                    <FormControlLabel value="high" control={<Radio />} label="高" />
                    <FormControlLabel value="medium" control={<Radio />} label="中" />
                    <FormControlLabel value="low" control={<Radio />} label="低" />
                  </RadioGroup>
                </FormControl>
              )}

              {/* 类型选择组件 */}
              {missingInfo?.missingFields.includes('type') && (
                <FormControl fullWidth>
                  <FormLabel>类型选择</FormLabel>
                  <Stack spacing={2} sx={{ mt: 1 }}>
                    <Button
                      fullWidth
                      variant={supplementForm.type === 'task' ? 'contained' : 'outlined'}
                      size="large"
                      onClick={() => setSupplementForm({...supplementForm, type: 'task'})}
                      sx={{ py: 2, justifyContent: 'flex-start', px: 2 }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ fontSize: '1.5rem' }}>📋</Box>
                        <Stack alignItems="flex-start">
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            任务
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            一次性完成的事项
                          </Typography>
                        </Stack>
                      </Stack>
                    </Button>
                    <Button
                      fullWidth
                      variant={supplementForm.type === 'habit' ? 'contained' : 'outlined'}
                      size="large"
                      color={supplementForm.type === 'habit' ? 'primary' : 'inherit'}
                      onClick={() => setSupplementForm({...supplementForm, type: 'habit'})}
                      sx={{ py: 2, justifyContent: 'flex-start', px: 2 }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ fontSize: '1.5rem' }}>🎯</Box>
                        <Stack alignItems="flex-start">
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            习惯
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            需要持续养成的习惯
                          </Typography>
                        </Stack>
                      </Stack>
                    </Button>
                  </Stack>
                </FormControl>
              )}

            </Stack>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setGuidedDialogOpen(false); resetSupplementForm(); }}>
            取消
          </Button>
          <Button
            onClick={handleSupplementAndRegenerate}
            variant="contained"
            startIcon={<Sparkles size={18} />}
          >
            重新生成
          </Button>
        </DialogActions>
      </Dialog>

      {/* Type Selection Dialog */}
      <Dialog open={typeSelectDialogOpen} onClose={() => { setTypeSelectDialogOpen(false); setTaskToAdd(null); }} maxWidth="xs" fullWidth>
        <DialogTitle>选择类型</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Alert severity="info" icon={<HelpCircle size={20} />}>
              AI 无法判断这是任务还是习惯，请手动选择：
            </Alert>
            {taskToAdd && (
              <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {taskToAdd.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {taskToAdd.description}
                </Typography>
              </Box>
            )}
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={() => confirmAddTaskWithType('task')}
              sx={{ py: 2 }}
            >
              📋 任务（一次性完成）
            </Button>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={() => confirmAddTaskWithType('habit')}
              sx={{ py: 2 }}
            >
              🎯 习惯（持续养成）
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setTypeSelectDialogOpen(false); setTaskToAdd(null); }}>
            取消
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
/**
 * 鼓励语服务
 * 使用 DeepSeek AI 生成50条与计划相关的鼓励话语
 * 存储在 localStorage，用完后自动重新生成
 */

const STORAGE_KEY = 'deadliner_encouragements';
const INDEX_KEY = 'deadliner_encouragement_index';
const BATCH_SIZE = 50;

interface EncouragementData {
  messages: string[];
  generatedAt: number;
}

/**
 * 使用 DeepSeek AI 生成鼓励语
 */
async function generateEncouragements(): Promise<string[]> {
  const apiKey = localStorage.getItem('deepseek_api_key');
  const baseUrl = localStorage.getItem('deepseek_base_url') || 'https://api.deepseek.com';

  if (!apiKey) {
    console.warn('未配置 DeepSeek API Key，使用默认鼓励语');
    return getDefaultEncouragements();
  }

  try {
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `你是一个任务管理助手。生成50条简短、积极、有趣的鼓励话语，用于任务完成后的奖励提示。

要求：
1. 每条话语不超过20个字
2. 与任务、计划、目标、成就相关
3. 积极向上，有趣幽默
4. 包含emoji表情
5. 返回纯 JSON 数组格式：["话语1", "话语2", ...]
6. 不要返回其他文字或代码块标记

示例：
["任务完成 ✓ 奖励：硬大战！😎", "目标达成！你真是计划大师 🎯", "又完成一个！效率惊人 ⚡"]`
          },
          {
            role: 'user',
            content: '请生成50条鼓励话语'
          }
        ],
        temperature: 0.8,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error('API 调用失败');
    }

    const data = await response.json();
    let content = data.choices[0].message.content.trim();

    // 清理可能的代码块标记
    if (content.startsWith('```json')) {
      content = content.replace(/```json\s*/, '').replace(/```\s*$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/```\s*/, '').replace(/```\s*$/, '');
    }

    // 提取 JSON 数组
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      content = jsonMatch[0];
    }

    const messages = JSON.parse(content);

    if (Array.isArray(messages) && messages.length > 0) {
      return messages;
    } else {
      throw new Error('生成的消息格式不正确');
    }
  } catch (error) {
    console.error('生成鼓励语失败:', error);
    return getDefaultEncouragements();
  }
}

/**
 * 默认鼓励语（当 API 不可用时使用）
 */
function getDefaultEncouragements(): string[] {
  return [
    '任务完成 ✓ 奖励：硬大战！😎',
    '目标达成！你真是计划大师 🎯',
    '又完成一个！效率惊人 ⚡',
    '完美执行！继续保持 ⭐',
    '里程碑达成！庆祝一下 🎉',
    '干得漂亮！实力认证 💪',
    '进度+1！势不可挡 🚀',
    '任务清单又短一点啦 ✨',
    '成就解锁！你是高手 🏆',
    '完成度UP！继续加油 🔥',
    '效率爆表！给你点赞 👍',
    '目标击破！所向披靡 💥',
    '又一个胜利！无人能挡 🎖️',
    '计划达成！执行力满分 📈',
    '任务攻克！你太牛了 🐂',
    '完成速度惊人！闪电侠 ⚡',
    '目标get！下一个走起 🎯',
    '进度刷新！一路领先 🏃',
    '完美收官！再接再厉 ✅',
    '任务搞定！轻松拿捏 🎮',
    '效率之星！你最闪耀 ⭐',
    '目标完成！继续进击 ⚔️',
    '又一次成功！无敌是你 🦸',
    '里程碑+1！稳步前进 🚶',
    '任务cleared！开心庆祝 🎊',
    '完成任务！经验值up 📊',
    '目标达成率100%！满分 💯',
    '效率满满！你是王者 👑',
    '又完成啦！快去休息 ☕',
    '进度条满格！完美 ✨',
    '任务终结者！厉害了 🎯',
    '目标狙击手！精准完成 🎯',
    '效率小能手！666 🔥',
    '完成速度刷新记录 ⏱️',
    '又一个任务倒下了 💪',
    '执行力爆棚！佩服 🙌',
    '目标收割机！收获满满 🌾',
    '任务终结！你赢了 🏆',
    '完美达成！无懈可击 ✨',
    '效率之神降临！膜拜 🙏',
    '进度飞速！火箭速度 🚀',
    '任务KO！你是冠军 🥇',
    '目标完美达成！满分 💯',
    '又一次胜利！势如破竹 ⚡',
    '完成任务！开启新篇章 📖',
    '效率惊人！给跪了 🙇',
    '目标实现！梦想成真 ✨',
    '任务完结！撒花庆祝 🎉',
    '完美执行！天秀操作 🌟',
    '进度满满！继续冲刺 🏃',
  ];
}

/**
 * 从存储中获取鼓励语数据
 */
function getStoredData(): EncouragementData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('读取鼓励语数据失败:', error);
  }
  return null;
}

/**
 * 保存鼓励语数据到存储
 */
function saveData(data: EncouragementData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('保存鼓励语数据失败:', error);
  }
}

/**
 * 获取当前索引
 */
function getCurrentIndex(): number {
  try {
    const index = localStorage.getItem(INDEX_KEY);
    return index ? parseInt(index, 10) : 0;
  } catch (error) {
    return 0;
  }
}

/**
 * 保存当前索引
 */
function saveIndex(index: number): void {
  try {
    localStorage.setItem(INDEX_KEY, index.toString());
  } catch (error) {
    console.error('保存索引失败:', error);
  }
}

/**
 * 获取下一条鼓励语
 */
export async function getNextEncouragement(): Promise<string> {
  let data = getStoredData();
  let currentIndex = getCurrentIndex();

  // 如果没有数据或者已经用完，重新生成
  if (!data || !data.messages || data.messages.length === 0 || currentIndex >= data.messages.length) {
    console.log('生成新的鼓励语...');
    const messages = await generateEncouragements();
    data = {
      messages,
      generatedAt: Date.now(),
    };
    saveData(data);
    currentIndex = 0;
  }

  // 获取当前消息
  const message = data.messages[currentIndex];

  // 更新索引
  saveIndex(currentIndex + 1);

  return message;
}

/**
 * 重置鼓励语系统（手动触发重新生成）
 */
export async function resetEncouragements(): Promise<void> {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(INDEX_KEY);
  await getNextEncouragement(); // 立即生成新的
}

/**
 * 获取剩余鼓励语数量
 */
export function getRemainingCount(): number {
  const data = getStoredData();
  const currentIndex = getCurrentIndex();

  if (!data || !data.messages) {
    return 0;
  }

  return Math.max(0, data.messages.length - currentIndex);
}
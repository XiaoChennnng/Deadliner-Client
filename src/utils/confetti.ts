import * as confettiModule from 'canvas-confetti';

// 尝试获取正确的 confetti 函数
const confetti = (confettiModule as any).default || confettiModule;

/**
 * 触发礼炮庆祝动画
 * 从左右两侧同时发射
 */
export function triggerConfetti() {
  console.log('✨ triggerConfetti 函数被调用');
  console.log('confetti 对象:', confetti);
  console.log('confetti 类型:', typeof confetti);
  console.log('confettiModule:', confettiModule);

  // 检查 confetti 是否正确导入
  if (typeof confetti !== 'function') {
    console.error('❌ confetti 不是一个函数，无法执行');
    return;
  }

  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  console.log('🎊 开始礼炮动画循环');

  const interval: any = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      console.log('⏰ 礼炮动画结束');
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    try {
      // 从左侧发射
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0, 0.2), y: Math.random() - 0.2 },
        angle: randomInRange(55, 125),
      });

      // 从右侧发射
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.8, 1), y: Math.random() - 0.2 },
        angle: randomInRange(55, 125),
      });
    } catch (error) {
      console.error('❌ 礼炮动画执行出错:', error);
      clearInterval(interval);
    }
  }, 250);
}
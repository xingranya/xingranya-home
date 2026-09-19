import React, { useEffect, useRef } from 'react';

interface RainDrop {
  x: number;
  y: number;
  z: number; // 0.1(远) 到 1(近)
  len: number;
  speed: number;
  alpha: number;
  splashY: number;
  deflectionX: number;
}

interface SplashParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  life: number;
  maxLife: number;
}

interface WaterRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  isClick?: boolean;
}

/**
 * 意境雨景与环境光场背景组件
 * - 顶部居中微蓝柔光穹顶（超舒缓 22s 呼吸动画）
 * - 极细沉静微雨丝线（带有 Z 轴视差分层与真实运动模糊）
 * - 真实的微小水滴溅射（Splash Particles）与水面微涟漪
 * - 鼠标动态气流偏折与随机微风扰动
 * - 后台自动挂起休眠（零 CPU/电量损耗）
 */
export const AmbientBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const isRunningRef = useRef<boolean>(false);

  const dropsRef = useRef<RainDrop[]>([]);
  const ripplesRef = useRef<WaterRipple[]>([]);
  const splashParticlesRef = useRef<SplashParticle[]>([]);
  const mouseRef = useRef<{ x: number; y: number; active: boolean; lastMove: number }>({
    x: -999,
    y: -999,
    active: false,
    lastMove: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    const startTime = performance.now();

    // 初始化雨滴粒子池
    const initRainPool = () => {
      const isMobile = width < 768;
      // 桌面端加量以体现层次，远景稍多，近景稍少。约 70~90 滴
      const count = isMobile ? Math.floor(width / 24) : Math.floor(width / 18);
      const drops: RainDrop[] = [];

      for (let i = 0; i < count; i++) {
        const z = 0.2 + Math.random() * 0.8; // 0.2(远) -> 1(近)
        drops.push({
          x: Math.random() * (width + 300) - 150,
          y: Math.random() * height,
          z,
          len: (10 + Math.random() * 15) * z,
          speed: (8 + Math.random() * 6) * z,
          alpha: (0.1 + Math.random() * 0.2) * z,
          splashY: height - Math.random() * (height * 0.2 * (1 - z)) + 10,
          deflectionX: 0,
        });
      }

      dropsRef.current = drops;
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initRainPool();
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // 渲染循环
    const render = (now: number) => {
      if (!isRunningRef.current) return;

      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains('dark');
      const mouseActive = mouseRef.current.active && now - mouseRef.current.lastMove < 2000;
      
      // 基于正弦波的微风扰动
      const timeElapsed = (now - startTime) / 1000;
      const baseWindAngle = 0.22;
      const windFluctuation = Math.sin(timeElapsed * 0.5) * 0.08 + Math.cos(timeElapsed * 0.3) * 0.04;
      const windAngle = baseWindAngle + windFluctuation;

      // 1. 渲染并更新雨丝
      const drops = dropsRef.current;

      for (let i = 0; i < drops.length; i++) {
        const drop = drops[i];

        // 鼠标附近气流偏折计算
        if (mouseActive) {
          const dx = drop.x - mouseRef.current.x;
          const dy = drop.y - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120 * drop.z) {
            const force = (1 - dist / (120 * drop.z)) * 2.0 * drop.z;
            drop.deflectionX += (dx > 0 ? force : -force) * 0.4;
          }
        }
        drop.deflectionX *= 0.92; // 阻尼回弹

        // 绘制微雨丝线
        const startX = drop.x + drop.deflectionX;
        const startY = drop.y;
        const endX = startX - drop.len * windAngle;
        const endY = startY - drop.len;

        // 使用线性渐变模拟真实下落尾迹（头部亮，尾部暗）
        const grad = ctx.createLinearGradient(startX, startY, endX, endY);
        if (isDark) {
          grad.addColorStop(0, `rgba(255, 192, 203, ${drop.alpha})`);
          grad.addColorStop(1, `rgba(255, 192, 203, 0)`);
        } else {
          // 亮色模式使用樱花粉并加重不透明度以提高可见度
          grad.addColorStop(0, `rgba(224, 86, 118, ${Math.min(1, drop.alpha * 2.8)})`);
          grad.addColorStop(1, `rgba(224, 86, 118, 0)`);
        }

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = Math.max(0.4, 1.5 * drop.z);
        ctx.stroke();

        // 推进雨滴位置
        drop.x += drop.speed * windAngle + drop.deflectionX;
        drop.y += drop.speed;

        // 触底或达到溅射深度产生飞溅与微涟漪
        if (drop.y >= drop.splashY) {
          // 只在近景/中景雨滴落地时产生飞溅，且随机率控制性能
          if (drop.z > 0.4 && Math.random() > 0.3) {
            // 生成涟漪
            if (ripplesRef.current.length < 30) {
              ripplesRef.current.push({
                x: drop.x,
                y: drop.splashY,
                radius: 1,
                maxRadius: (8 + Math.random() * 10) * drop.z,
                alpha: (isDark ? 0.2 : 0.45) * drop.z,
                isClick: false,
              });
            }
            // 生成飞溅粒子
            if (splashParticlesRef.current.length < 80) {
              const particleCount = Math.floor(Math.random() * 3) + 1;
              for (let p = 0; p < particleCount; p++) {
                splashParticlesRef.current.push({
                  x: drop.x,
                  y: drop.splashY,
                  vx: (Math.random() - 0.5) * 2,
                  vy: -(Math.random() * 2 + 1) * drop.z,
                  radius: (Math.random() * 0.8 + 0.4) * drop.z,
                  alpha: (isDark ? 0.4 : 0.6) * drop.z,
                  life: 0,
                  maxLife: 20 + Math.random() * 15,
                });
              }
            }
          }

          // 重置雨滴到顶部随机位置
          const z = 0.2 + Math.random() * 0.8;
          drop.z = z;
          drop.x = Math.random() * (width + 300) - 150;
          drop.y = -(10 + Math.random() * 15) * z - Math.random() * 40;
          drop.len = (10 + Math.random() * 15) * z;
          drop.speed = (8 + Math.random() * 6) * z;
          drop.alpha = (0.1 + Math.random() * 0.2) * z;
          drop.splashY = height - Math.random() * (height * 0.2 * (1 - z)) + 10;
          drop.deflectionX = 0;
        }
      }

      // 2. 渲染并更新飞溅粒子 (Splash Particles)
      const activeParticles: SplashParticle[] = [];
      const particles = splashParticlesRef.current;
      
      if (particles.length > 0) {
        ctx.fillStyle = isDark ? 'rgba(255, 192, 203, 0.8)' : 'rgba(224, 86, 118, 0.8)';
        ctx.beginPath();
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.15; // 重力
          p.life++;
          p.radius *= 0.94; // 半径缩减替代单批次无法独立透明度的问题

          if (p.life < p.maxLife && p.radius > 0.1) {
            ctx.moveTo(p.x, p.y);
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            activeParticles.push(p);
          }
        }
        ctx.fill();
      }
      splashParticlesRef.current = activeParticles;

      // 3. 渲染并更新落水涟漪与点击水晕
      const activeRipples: WaterRipple[] = [];
      const ripples = ripplesRef.current;

      for (let i = 0; i < ripples.length; i++) {
        const r = ripples[i];
        const growSpeed = r.isClick ? 0.12 : 0.16;
        const fadeSpeed = r.isClick ? 0.93 : 0.91;

        r.radius += (r.maxRadius - r.radius) * growSpeed + 0.3;
        r.alpha *= fadeSpeed;

        if (r.alpha > 0.008 && r.radius < r.maxRadius) {
          ctx.save();
          ctx.beginPath();
          // 微椭圆透视水圈
          ctx.ellipse(r.x, r.y, r.radius, r.radius * 0.45, 0, 0, Math.PI * 2);

          if (isDark) {
            ctx.strokeStyle = `rgba(255, 192, 203, ${r.alpha * 0.8})`;
            ctx.fillStyle = `rgba(255, 143, 166, ${r.alpha * 0.04})`;
          } else {
            ctx.strokeStyle = `rgba(224, 86, 118, ${r.alpha * 1.5})`;
            ctx.fillStyle = `rgba(224, 86, 118, ${r.alpha * 0.08})`;
          }

          ctx.lineWidth = Math.max(0.4, (r.isClick ? 1.2 : 0.75) * (1 - r.radius / r.maxRadius));
          ctx.stroke();
          ctx.fill();
          ctx.restore();

          activeRipples.push(r);
        }
      }

      ripplesRef.current = activeRipples;

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    const startLoop = () => {
      if (!isRunningRef.current) {
        isRunningRef.current = true;
        animFrameIdRef.current = requestAnimationFrame(render);
      }
    };

    const stopLoop = () => {
      isRunningRef.current = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };

    // 交互事件监听
    const handlePointerMove = (e: PointerEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
      mouseRef.current.lastMove = performance.now();
    };

    const handlePointerDown = (e: PointerEvent) => {
      ripplesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        radius: 2,
        maxRadius: 52,
        alpha: 0.26,
        isClick: true,
      });
    };

    // 页面可见性优化：切后台完全停止计算
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopLoop();
      } else {
        startLoop();
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    startLoop();

    return () => {
      stopLoop();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-20 overflow-hidden select-none transition-colors duration-500"
    >
      {/* 柔和樱花粉纯净基底渐变 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFF1F4] via-[#FDF6F8] to-[#FFF8F9] dark:from-[#0B121D] dark:via-[#080D15] dark:to-[#070B12]" />

      {/* 顶部樱花粉柔光穹顶：居中大尺寸高斯漫射微光，超舒缓 22s 呼吸阻尼 */}
      <div
        className="absolute -top-[10%] left-1/2 w-[420px] sm:w-[780px] lg:w-[980px] h-[360px] sm:h-[520px] lg:h-[620px] rounded-[100%] opacity-70 dark:opacity-30 blur-[100px] sm:blur-[140px] transition-all duration-1000"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(255, 192, 203, 0.45) 0%, rgba(255, 168, 184, 0.18) 45%, rgba(255, 228, 234, 0.06) 70%, transparent 80%)',
          animation: 'ambientBreathGlow 22s ease-in-out infinite',
          willChange: 'transform, opacity',
        }}
      />

      {/* 暗色模式专属 sakura 微光漫射（极低对比度，消除刺眼光感） */}
      <div
        className="hidden dark:block absolute -top-[8%] left-1/2 w-[700px] lg:w-[900px] h-[480px] rounded-[100%] opacity-25 blur-[130px]"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(224, 86, 118, 0.28) 0%, rgba(74, 22, 40, 0.16) 50%, transparent 75%)',
          animation: 'ambientBreathGlow 24s ease-in-out infinite reverse',
          willChange: 'transform',
        }}
      />

      {/* 极细腻微点网格遮罩，赋予纸张触感 */}
      <div className="absolute inset-0 bg-paper-texture opacity-40 dark:opacity-20" />

      {/* 60FPS 极轻量微雨丝与沉浸水波 Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />
    </div>
  );
};

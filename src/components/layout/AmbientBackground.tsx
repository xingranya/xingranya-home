import React, { useEffect, useRef } from 'react';

interface RainDrop {
  x: number;
  y: number;
  z: number;
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

/** 樱花粉雨景：首屏绘制后启动，手机降低开销，后台和减少动态模式停止。 */
export const AmbientBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const background = canvas?.parentElement;
    if (!canvas || !background) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobileQuery = window.matchMedia('(max-width: 767px), (pointer: coarse)');
    const root = document.documentElement;
    const sprite = document.createElement('canvas');
    sprite.width = 8;
    sprite.height = 64;
    const spriteContext = sprite.getContext('2d');
    if (!spriteContext) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let lightMode = false;
    let isDark = root.classList.contains('dark');
    let ready = false;
    let running = false;
    let frame = 0;
    let paintFrame = 0;
    let resizeFrame = 0;
    let idleTask = 0;
    let fallbackTimer = 0;
    let lastTick = 0;
    let lastDraw = 0;
    const startTime = performance.now();
    const drops: RainDrop[] = [];
    const ripples: WaterRipple[] = [];
    const particles: SplashParticle[] = [];
    const mouse = { x: -999, y: -999, lastMove: -Infinity };

    // 雨丝渐变只在主题变化时生成，绘制时复用。
    const updateColor = (force = false) => {
      const nextIsDark = root.classList.contains('dark');
      if (!force && nextIsDark === isDark) return;
      isDark = nextIsDark;
      const color = isDark ? '255, 192, 203' : '224, 86, 118';
      const gradient = spriteContext.createLinearGradient(0, 0, 0, sprite.height);
      gradient.addColorStop(0, `rgba(${color}, 0)`);
      gradient.addColorStop(1, `rgba(${color}, 1)`);
      spriteContext.clearRect(0, 0, sprite.width, sprite.height);
      spriteContext.fillStyle = gradient;
      spriteContext.fillRect(0, 0, sprite.width, sprite.height);
    };

    const resetDrop = (drop: RainDrop, initial = false) => {
      const z = 0.2 + Math.random() * 0.8;
      drop.z = z;
      drop.x = Math.random() * (width + 300) - 150;
      drop.y = initial ? Math.random() * height : -40;
      drop.len = (10 + Math.random() * 15) * z;
      drop.speed = (8 + Math.random() * 6) * z;
      drop.alpha = (0.1 + Math.random() * 0.2) * z;
      drop.splashY = height - Math.random() * (height * 0.2 * (1 - z)) + 10;
      drop.deflectionX = 0;
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      lightMode = mobileQuery.matches || (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4);
      dpr = Math.min(window.devicePixelRatio || 1, lightMode ? 1 : 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = lightMode ? Math.min(24, Math.floor(width / 28)) : Math.min(90, Math.floor(width / 18));
      drops.length = 0;
      ripples.length = 0;
      particles.length = 0;
      for (let i = 0; i < count; i++) {
        const drop: RainDrop = { x: 0, y: 0, z: 0, len: 0, speed: 0, alpha: 0, splashY: 0, deflectionX: 0 };
        resetDrop(drop, true);
        drops.push(drop);
      }
    };

    const render = (now: number) => {
      if (!running) return;
      frame = window.requestAnimationFrame(render);
      const interval = 1000 / (lightMode ? 30 : 60);
      const elapsed = now - lastTick;
      if (elapsed < interval) return;
      lastTick = now - (elapsed % interval);
      // 按实际经过时间推进，降低帧率时保持雨丝原来的速度。
      const step = (lastDraw ? Math.min(now - lastDraw, 50) : interval) / (1000 / 60);
      lastDraw = now;
      ctx.clearRect(0, 0, width, height);
      const mouseActive = !lightMode && now - mouse.lastMove < 2000;
      const time = (now - startTime) / 1000;
      const wind = 0.22 + Math.sin(time * 0.5) * 0.08 + Math.cos(time * 0.3) * 0.04;
      const maxRipples = lightMode ? 10 : 30;
      const maxParticles = lightMode ? 16 : 80;

      for (const drop of drops) {
        if (mouseActive) {
          const dx = drop.x - mouse.x;
          const dy = drop.y - mouse.y;
          const distanceSquared = dx * dx + dy * dy;
          const reach = 120 * drop.z;
          if (distanceSquared < reach * reach) {
            const force = (1 - Math.sqrt(distanceSquared) / reach) * 0.8 * drop.z * step;
            drop.deflectionX += dx > 0 ? force : -force;
          }
        }
        drop.deflectionX *= Math.pow(0.92, step);
        const lineWidth = Math.max(0.4, 1.5 * drop.z);
        ctx.setTransform(dpr, 0, wind * dpr, dpr, (drop.x + drop.deflectionX) * dpr, drop.y * dpr);
        ctx.globalAlpha = Math.min(1, drop.alpha * (isDark ? 1 : 2.8));
        ctx.drawImage(sprite, -lineWidth / 2, -drop.len, lineWidth, drop.len);
        drop.x += (drop.speed * wind + drop.deflectionX) * step;
        drop.y += drop.speed * step;

        if (drop.y >= drop.splashY) {
          if (drop.z > 0.4 && Math.random() > (lightMode ? 0.6 : 0.3)) {
            if (ripples.length < maxRipples) {
              ripples.push({ x: drop.x, y: drop.splashY, radius: 1, maxRadius: (8 + Math.random() * 10) * drop.z, alpha: (isDark ? 0.2 : 0.45) * drop.z });
            }
            const count = lightMode ? 1 : Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < count && particles.length < maxParticles; i++) {
              particles.push({
                x: drop.x, y: drop.splashY, vx: (Math.random() - 0.5) * 2,
                vy: -(Math.random() * 2 + 1) * drop.z,
                radius: (Math.random() * 0.8 + 0.4) * drop.z,
                life: 0, maxLife: 20 + Math.random() * 15,
              });
            }
          }
          resetDrop(drop);
        }
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = isDark ? 'rgb(255, 192, 203)' : 'rgb(224, 86, 118)';
      ctx.beginPath();
      let liveParticles = 0;
      for (const particle of particles) {
        particle.x += particle.vx * step;
        particle.y += particle.vy * step;
        particle.vy += 0.15 * step;
        particle.life += step;
        particle.radius *= Math.pow(0.94, step);
        if (particle.life < particle.maxLife && particle.radius > 0.1) {
          ctx.moveTo(particle.x, particle.y);
          ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          particles[liveParticles++] = particle;
        }
      }
      ctx.fill();
      particles.length = liveParticles;

      let liveRipples = 0;
      ctx.strokeStyle = isDark ? 'rgb(255, 192, 203)' : 'rgb(224, 86, 118)';
      for (const ripple of ripples) {
        ripple.radius += (ripple.maxRadius - ripple.radius) * (1 - Math.pow(1 - (ripple.isClick ? 0.12 : 0.16), step)) + 0.3 * step;
        ripple.alpha *= Math.pow(ripple.isClick ? 0.93 : 0.91, step);
        if (ripple.alpha > 0.008 && ripple.radius < ripple.maxRadius) {
          ctx.beginPath();
          ctx.ellipse(ripple.x, ripple.y, ripple.radius, ripple.radius * 0.45, 0, 0, Math.PI * 2);
          ctx.lineWidth = Math.max(0.4, (ripple.isClick ? 1.2 : 0.75) * (1 - ripple.radius / ripple.maxRadius));
          ctx.globalAlpha = Math.min(1, ripple.alpha * (isDark ? 0.8 : 1.5));
          ctx.stroke();
          ctx.globalAlpha = ripple.alpha * (isDark ? 0.04 : 0.08);
          ctx.fill();
          ripples[liveRipples++] = ripple;
        }
      }
      ripples.length = liveRipples;
      ctx.globalAlpha = 1;
    };

    const syncMotion = () => {
      const shouldRun = ready && !document.hidden && !motionQuery.matches;
      background.dataset.running = String(shouldRun);
      if (running === shouldRun) return;
      running = shouldRun;
      if (running) {
        lastTick = performance.now();
        lastDraw = 0;
        frame = window.requestAnimationFrame(render);
      } else {
        window.cancelAnimationFrame(frame);
        if (motionQuery.matches) ctx.clearRect(0, 0, width, height);
      }
    };

    const handleResize = () => {
      if (!ready) return;
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(resize);
    };
    const handlePointerMove = (event: PointerEvent) => {
      if (!running || lightMode) return;
      mouse.x = event.clientX;
      mouse.y = event.clientY;
      mouse.lastMove = performance.now();
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (!running || ripples.length >= (lightMode ? 10 : 30)) return;
      ripples.push({ x: event.clientX, y: event.clientY, radius: 2, maxRadius: 52, alpha: 0.26, isClick: true });
    };

    const start = () => {
      updateColor(true);
      resize();
      ready = true;
      syncMotion();
    };
    // 等主内容至少绘制一帧，再在空闲时分配装饰性画布。
    paintFrame = window.requestAnimationFrame(() => {
      paintFrame = window.requestAnimationFrame(() => {
        if (typeof window.requestIdleCallback === 'function') {
          idleTask = window.requestIdleCallback(start, { timeout: 1200 });
        } else {
          fallbackTimer = window.setTimeout(start, 100);
        }
      });
    });

    const themeObserver = new MutationObserver(() => { if (ready) updateColor(); });
    themeObserver.observe(root, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('resize', handleResize);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    document.addEventListener('visibilitychange', syncMotion);
    motionQuery.addEventListener('change', syncMotion);
    mobileQuery.addEventListener('change', handleResize);

    return () => {
      ready = false;
      syncMotion();
      window.cancelAnimationFrame(paintFrame);
      window.cancelAnimationFrame(resizeFrame);
      if (idleTask) window.cancelIdleCallback(idleTask);
      window.clearTimeout(fallbackTimer);
      themeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('visibilitychange', syncMotion);
      motionQuery.removeEventListener('change', syncMotion);
      mobileQuery.removeEventListener('change', handleResize);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      data-running="false"
      className="ambient-background fixed inset-0 pointer-events-none -z-20 overflow-hidden select-none transition-colors duration-500"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFF1F4] via-[#FDF6F8] to-[#FFF8F9] dark:from-[#0B121D] dark:via-[#080D15] dark:to-[#070B12]" />
      <div
        className="ambient-glow absolute -top-[10%] left-1/2 w-[420px] sm:w-[780px] lg:w-[980px] h-[360px] sm:h-[520px] lg:h-[620px] rounded-[100%] opacity-70 dark:opacity-30 blur-[100px] sm:blur-[140px]"
        style={{ background: 'radial-gradient(ellipse at center, rgba(255, 192, 203, 0.45) 0%, rgba(255, 168, 184, 0.18) 45%, rgba(255, 228, 234, 0.06) 70%, transparent 80%)' }}
      />
      <div
        className="ambient-glow ambient-glow-dark hidden dark:block absolute -top-[8%] left-1/2 w-[700px] lg:w-[900px] h-[480px] rounded-[100%] opacity-25 blur-[130px]"
        style={{ background: 'radial-gradient(ellipse at center, rgba(224, 86, 118, 0.28) 0%, rgba(74, 22, 40, 0.16) 50%, transparent 75%)' }}
      />
      <div className="absolute inset-0 bg-paper-texture opacity-40 dark:opacity-20" />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />
    </div>
  );
};

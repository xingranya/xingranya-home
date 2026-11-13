import { useEffect, useId, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { signatureStrokes } from './signature-strokes';

export function HeroSignature() {
  const id = useId().replace(/:/g, '');
  const ref = useRef<HTMLSpanElement>(null);
  // 首屏 HTML 直接启用 CSS 动画，避免等待 React 挂载后再起笔。
  const [animated, setAnimated] = useState(true);
  const [running, setRunning] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const bounds = node.getBoundingClientRect();
    let visible = bounds.bottom > 0 && bounds.top < window.innerHeight;
    const update = () => {
      setAnimated(!preference.matches);
      setRunning(visible && !document.hidden && !preference.matches);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    observer.observe(node);
    preference.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    update();
    return () => {
      observer.disconnect();
      preference.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  return (
    <span ref={ref} className="hero-signature" data-animated={animated} data-running={running && !paused}>
      <svg className="hero-signature-art" viewBox="-48 -220 730 330" role="img" aria-label="xran 猫耳手写签名">
        <title>xran</title>
        <defs>
          <linearGradient id={`${id}-pink`} x1="0" y1="0" x2="1" y2="0.6" gradientUnits="objectBoundingBox">
            <stop className="signature-pink-deep" offset="0" />
            <stop className="signature-pink-bright" offset="0.35" />
            <stop className="signature-pink-soft" offset="0.65" />
            <stop className="signature-pink-deep" offset="1" />
          </linearGradient>
          {signatureStrokes.map((stroke, index) => (
            <mask key={index} id={`${id}-stroke-${index}`} maskUnits="userSpaceOnUse" x="-40" y="-180" width="730" height="300">
              <path className={`signature-mask signature-stroke-${index}`} d={stroke.line} pathLength="1" fill="none" stroke="white" strokeWidth="28" strokeLinecap="round" strokeLinejoin="round" />
            </mask>
          ))}
        </defs>
        <g transform="rotate(-6 285 -40)">
          <g className="signature-writing" fill={`url(#${id}-pink)`}>
            {signatureStrokes.map((stroke, index) => <path key={index} d={stroke.ink} mask={`url(#${id}-stroke-${index})`} />)}
            <g className="signature-ears" fill="none" stroke={`url(#${id}-pink)`} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M30-135Q13-191 30-185Q60-173 83-147M35-148Q27-176 38-171L62-153" />
              <path d="M458-147Q483-197 496-183Q511-166 510-139M472-153L490-176Q498-167 500-155" />
            </g>
          </g>
          <path className="signature-spark" d="M-7 0 0-7 7 0 0 7Z" fill="currentColor" aria-hidden="true" />
        </g>
      </svg>
      {animated && (
        <button type="button" className="hero-signature-control" aria-label={paused ? '播放签名动画' : '暂停签名动画'} aria-pressed={paused} onClick={() => setPaused(!paused)}>
          {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
        </button>
      )}
    </span>
  );
}

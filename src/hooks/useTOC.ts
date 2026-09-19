import { useState, useEffect } from 'react';
import type { TOCItem } from '../types';

export function useTOC(toc: TOCItem[]) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (!toc || toc.length === 0) return;

    let ticking = false;

    const updateActiveHeading = () => {
      const headings = toc
        .map((item) => document.getElementById(item.id))
        .filter((el): el is HTMLElement => el !== null);

      if (headings.length === 0) return;

      // 触底时自动高亮最后一项
      const isBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 60;
      if (isBottom) {
        setActiveId(headings[headings.length - 1].id);
        return;
      }

      // 视口距离顶部 130px 作为判定基准线
      const threshold = 130;
      let currentId = headings[0].id;

      for (let i = 0; i < headings.length; i++) {
        const rect = headings[i].getBoundingClientRect();
        if (rect.top <= threshold) {
          currentId = headings[i].id;
        } else {
          break;
        }
      }

      setActiveId(currentId);
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateActiveHeading);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    // 初始化执行
    updateActiveHeading();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [toc]);

  return activeId;
}

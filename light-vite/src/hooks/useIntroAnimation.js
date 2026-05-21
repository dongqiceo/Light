import { useEffect, useState } from 'react';
import { animate, stagger } from 'animejs';

export function useIntroAnimation(introRef, doneDelayMs = 2800) {
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    const root = introRef.current;
    const titleLetters = root?.querySelectorAll('.intro-letter');
    const subtitleLetters = root?.querySelectorAll('.intro-subtitle-letter');
    const line = root?.querySelector('.intro-line');
    const tagline = root?.querySelector('.intro-tagline');
    const scrollHint = root?.querySelector('.intro-scroll');

    if (titleLetters?.length) {
      animate(titleLetters, {
        opacity: [0, 1],
        translateY: [60, 0],
        delay: stagger(90, { start: 280 }),
        duration: 1200,
        ease: 'outExpo',
      });
    }

    if (subtitleLetters?.length) {
      animate(subtitleLetters, {
        opacity: [0, 1],
        translateY: [32, 0],
        delay: stagger(70, { start: 950 }),
        duration: 1000,
        ease: 'outExpo',
      });
    }

    if (line) {
      animate(line, {
        scaleX: [0, 1],
        opacity: [0, 1],
        delay: 1500,
        duration: 900,
        ease: 'outExpo',
      });
    }

    if (tagline) {
      animate(tagline, {
        opacity: [0, 1],
        translateY: [20, 0],
        delay: 1750,
        duration: 850,
        ease: 'outExpo',
      });
    }

    if (scrollHint) {
      animate(scrollHint, {
        opacity: [0, 1],
        delay: 2200,
        duration: 800,
        ease: 'outQuad',
      });
    }

    const timer = setTimeout(() => setIntroDone(true), doneDelayMs);
    return () => clearTimeout(timer);
  }, [introRef, doneDelayMs]);

  return introDone;
}

import { useEffect, useState } from 'react';

export function useScrollPosition(threshold = 300) {
  const [pastThreshold, setPastThreshold] = useState(false);

  useEffect(() => {
    const onScroll = () => setPastThreshold(window.scrollY > threshold);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return pastThreshold;
}

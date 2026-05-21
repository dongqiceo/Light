import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useGsapPage(scopeRef, setup, deps = []) {
  useEffect(() => {
    if (!scopeRef.current) return undefined;

    const ctx = gsap.context(() => {
      setup(gsap);
    }, scopeRef);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

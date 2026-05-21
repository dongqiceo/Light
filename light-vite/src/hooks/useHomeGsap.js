import { useGsapPage } from './useGsapPage';

export function useHomeGsap(pageRef, loading) {
  useGsapPage(
    pageRef,
    (gsap) => {
      if (loading) return;

      gsap.utils.toArray('.reveal-up').forEach((el) => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
          y: 48,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
        });
      });

      gsap.utils.toArray('.stat-item').forEach((el, i) => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: 'top 90%' },
          y: 32,
          opacity: 0,
          duration: 0.7,
          delay: i * 0.08,
          ease: 'power2.out',
        });
      });

      gsap.utils.toArray('.product-card').forEach((el, i) => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: 'top 92%' },
          y: 40,
          opacity: 0,
          duration: 0.7,
          delay: (i % 3) * 0.1,
          ease: 'power2.out',
        });
      });

      gsap.utils.toArray('.pillar-card').forEach((el, i) => {
        gsap.from(el, {
          scrollTrigger: { trigger: '.pillars-grid', start: 'top 75%' },
          y: 50,
          opacity: 0,
          duration: 0.8,
          delay: i * 0.15,
          ease: 'power3.out',
        });
      });

      gsap.from('.about-visual img', {
        scrollTrigger: { trigger: '.about-section', start: 'top 70%' },
        scale: 1.08,
        opacity: 0,
        duration: 1.2,
        ease: 'power2.out',
      });

      gsap.from('.cta-card', {
        scrollTrigger: {
          trigger: '.cta-section',
          start: 'top 90%',
          toggleActions: 'play none none none',
          once: true,
        },
        y: 32,
        duration: 0.9,
        ease: 'power3.out',
      });
    },
    [loading],
  );
}

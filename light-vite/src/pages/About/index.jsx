import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useGsapPage } from '../../hooks/useGsapPage';
import PageHero from '../../components/ui/PageHero';
import AboutValues from './AboutValues';
import AboutContact from './AboutContact';

export default function About() {
  const { t } = useTranslation();
  const pageRef = useRef(null);

  useGsapPage(
    pageRef,
    (gsap) => {
      gsap.from('.page-hero-content', { y: 40, opacity: 0, duration: 1, ease: 'power3.out' });
      gsap.utils.toArray('.about-card').forEach((el, i) => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: 'top 88%' },
          y: 36,
          opacity: 0,
          duration: 0.8,
          delay: i * 0.1,
          ease: 'power2.out',
        });
      });
    },
    [],
  );

  return (
    <div className="about-page" ref={pageRef}>
      <PageHero title={t('about.title')} subtitle={t('about.subtitle')} minimal />

      <div className="container page-body">
        <section className="about-intro about-card">
          <p className="about-desc">{t('about.description')}</p>
        </section>

        <AboutValues />
      </div>
    </div>
  );
}

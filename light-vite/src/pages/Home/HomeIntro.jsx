import { useTranslation } from 'react-i18next';
import { INTRO_BRAND_LINES } from '../../constants/home';

export default function HomeIntro({ introRef, introDone }) {
  const { t } = useTranslation();

  return (
    <section className={`intro ${introDone ? 'intro-done' : ''}`} ref={introRef}>
      <div className="intro-glow intro-glow-a" aria-hidden="true" />
      <div className="intro-glow intro-glow-b" aria-hidden="true" />
      <div className="intro-center">
        <div className="intro-brand" aria-label="YEELEN Lighting">
          {INTRO_BRAND_LINES.map(({ text, rowClass, letterClass }) => (
            <div key={text} className={rowClass} aria-hidden="true">
              {text.split('').map((letter, i) => (
                <span key={`${text}-${i}`} className={letterClass}>
                  {letter}
                </span>
              ))}
            </div>
          ))}
        </div>
        <div className="intro-line" />
        <p className="intro-tagline">{t('home.premiumSolutions')}</p>
      </div>
    </section>
  );
}

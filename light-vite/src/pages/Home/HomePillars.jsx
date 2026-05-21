import { useTranslation } from 'react-i18next';
import { FEATURE_KEYS } from '../../constants/home';

export default function HomePillars() {
  const { t } = useTranslation();

  return (
    <section className="pillars-section section-pad">
      <div className="container">
        <div className="section-head reveal-up">
          <span className="section-label">{t('home.whyChooseUs')}</span>
          <h2 className="section-heading">{t('about.values')}</h2>
        </div>
        <div className="pillars-grid">
          {FEATURE_KEYS.map((f) => (
            <article key={f.icon} className="pillar-card">
              <span className="pillar-num">{f.icon}</span>
              <h3>{t(f.titleKey)}</h3>
              <p>{t(f.descKey)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

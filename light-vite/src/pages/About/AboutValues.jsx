import { useTranslation } from 'react-i18next';
import { ABOUT_VALUES } from '../../constants/about';

export default function AboutValues() {
  const { t } = useTranslation();

  return (
    <section className="about-values">
      {ABOUT_VALUES.map((v) => (
        <article key={v.titleKey} className="about-card value-card">
          <h3>{t(v.titleKey)}</h3>
          <p>{t(v.textKey)}</p>
        </article>
      ))}

      <article className="about-card value-card full">
        <h3>{t('about.values')}</h3>
        <ul className="value-list">
          <li>
            <strong>{t('about.quality')}</strong>
            <span>{t('about.qualityDesc')}</span>
          </li>
          <li>
            <strong>{t('about.innovation')}</strong>
            <span>{t('about.innovationDesc')}</span>
          </li>
          <li>
            <strong>{t('about.customer')}</strong>
            <span>{t('about.customerDesc')}</span>
          </li>
        </ul>
      </article>
    </section>
  );
}

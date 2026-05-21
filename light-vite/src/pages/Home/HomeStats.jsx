import { useTranslation } from 'react-i18next';
import { HOME_STAT_KEYS } from '../../constants/home';

export default function HomeStats() {
  const { t } = useTranslation();

  return (
    <section className="stats-section">
      <div className="container stats-grid">
        {HOME_STAT_KEYS.map((key) => (
          <div key={key} className="stat-item">
            <span className="stat-num">{t(`home.stats.${key}.number`)}</span>
            <span className="stat-label">{t(`home.stats.${key}.label`)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

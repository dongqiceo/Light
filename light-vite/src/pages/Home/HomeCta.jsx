import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function HomeCta() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="cta-section section-pad">
      <div className="container">
        <div className="cta-card">
          <span className="section-label">YEELEN</span>
          <h2 className="section-heading">{t('home.readyTransform')}</h2>
          <p className="section-sub">{t('home.exploreCollection')}</p>
          <button type="button" className="btn-primary" onClick={() => navigate('/products')}>
            {t('home.exploreProducts')}
          </button>
        </div>
      </div>
    </section>
  );
}

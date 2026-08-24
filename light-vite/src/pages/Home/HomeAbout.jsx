import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getProductName } from '../../utils/product';

export default function HomeAbout({ featured }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const heroProduct = featured[0];
  const heroSrc = heroProduct?.image;

  return (
    <section className="about-section section-pad">
      <div className="container about-grid">
        <div className="about-visual reveal-up">
          {heroSrc ? (
            <img src={heroSrc} alt={getProductName(heroProduct, t)} loading="lazy" />
          ) : null}
        </div>
        <div className="about-content reveal-up">
          <span className="section-label">{t('nav.about')}</span>
          <h2 className="section-heading">YEELEN</h2>
          <p className="section-body">{t('about.description')}</p>
          <button type="button" className="btn-outline" onClick={() => navigate('/about')}>
            {t('common.learnMore')}
          </button>
        </div>
      </div>
    </section>
  );
}

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getProductImage, getProductName } from '../../utils/product';

export default function HomeGallery({ featured, loading }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="gallery-section section-pad">
      <div className="container">
        <div className="section-head reveal-up">
          <span className="section-label">{t('home.featuredCollection')}</span>
          <h2 className="section-heading">{t('home.gallery')}</h2>
          <p className="section-sub">{t('home.magneticTrackSolutions')}</p>
        </div>

        <div className={`gallery-mosaic ${loading ? 'loading' : ''}`}>
          {featured.slice(0, 6).map((product, i) => (
            <article
              key={product.id || i}
              className={`product-card mosaic-${(i % 6) + 1}`}
              onClick={() => navigate('/products')}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/products')}
              role="button"
              tabIndex={0}
            >
              <div className="product-img">
                {getProductImage(product) ? (
                  <img src={getProductImage(product)} alt={getProductName(product, t)} loading="lazy" />
                ) : null}
                <div className="product-overlay">
                  <span>{t('home.viewCollection')}</span>
                </div>
              </div>
              <div className="product-info">
                <h3>{getProductName(product, t)}</h3>
                {product.desc && <p>{product.desc}</p>}
              </div>
            </article>
          ))}
        </div>

        <div className="gallery-action reveal-up">
          <button type="button" className="btn-primary" onClick={() => navigate('/products')}>
            {t('home.viewAllProducts')}
          </button>
        </div>
      </div>
    </section>
  );
}

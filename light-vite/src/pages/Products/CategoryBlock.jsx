import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCategoryLabel, getDisplayItems, getImageUrl } from '../../utils/product';

export default function CategoryBlock({ category }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const items = getDisplayItems(category, t);

  const goDetail = (item, index) => {
    if (item.id) {
      navigate(`/products/${category.id}/${item.id}`);
    } else {
      navigate(`/products/${category.id}/${index}?byIndex=1`);
    }
  };

  return (
    <section className="category-block">
      <div className="category-head">
        <h2>{getCategoryLabel(category, t)}</h2>
        <span className="category-count">
          {items.length} {t('common.products')}
        </span>
      </div>
      <div className="category-grid">
        {items.map((item, index) => (
          <article
            key={item.id || index}
            className="product-tile"
            onClick={() => goDetail(item, index)}
            onKeyDown={(e) => e.key === 'Enter' && goDetail(item, index)}
            role="button"
            tabIndex={0}
          >
            <div className="product-tile-img">
              <img
                src={getImageUrl(category, item)}
                alt={item.name || getCategoryLabel(category, t)}
                loading="lazy"
              />
            </div>
            <div className="product-tile-info">
              <span className="product-tile-name">
                {item.name || getCategoryLabel(category, t)}
              </span>
              <span className="product-tile-num">#{String(index + 1).padStart(2, '0')}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

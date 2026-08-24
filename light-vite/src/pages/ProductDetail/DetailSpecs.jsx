import { useTranslation } from 'react-i18next';
import { joinSpec } from '../../utils/product';
import { formatLocalePrice } from '../../utils/formatLocalePrice';

export default function DetailSpecs({ name, description, price, priceStatus, specs }) {
  const { t, i18n } = useTranslation();

  const tf = (key, fallback) => {
    const text = t(key);
    return text === key ? fallback : text;
  };

  const lang = (i18n.language || 'en').slice(0, 2);
  const formattedPrice =
    priceStatus === 'ready' ? formatLocalePrice(price, lang) : null;
  const priceText = formattedPrice || '—';

  return (
    <aside className="detail-info">
      <p className="detail-brand">YEELEN</p>
      <h1>{name}</h1>
      <p className="detail-desc">{description}</p>

      <div className="detail-price">
        <span>{tf('productDetail.price', 'Price')}</span>
        <strong>{priceText}</strong>
      </div>

      <div className="detail-specs">
        <h3>{tf('productDetail.specifications', 'Specifications')}</h3>
        <dl>
          <div className="detail-spec-row">
            <dt>{tf('productDetail.color', 'Color')}</dt>
            <dd>{joinSpec(specs.colors)}</dd>
          </div>
          <div className="detail-spec-row">
            <dt>{tf('productDetail.size', 'Size')}</dt>
            <dd>{joinSpec(specs.sizes)}</dd>
          </div>
          <div className="detail-spec-row">
            <dt>{tf('productDetail.power', 'Power')}</dt>
            <dd>{joinSpec(specs.powers) || '-'}</dd>
          </div>
          <div className="detail-spec-row">
            <dt>{tf('productDetail.colorTemperature', 'Color Temperature')}</dt>
            <dd>{joinSpec(specs.colorTemperatures)}</dd>
          </div>
        </dl>
      </div>
    </aside>
  );
}

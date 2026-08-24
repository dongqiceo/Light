import { useTranslation } from 'react-i18next';
import { getCategoryLabel } from '../../utils/product';

function MarqueeGroup({ items, t, groupKey }) {
  return (
    <div className="marquee-group" aria-hidden={groupKey === 'clone'}>
      {items.map((cat) => (
        <span key={`${groupKey}-${cat.id ?? cat.name}`} className="marquee-item">
          {getCategoryLabel(cat, t)}
        </span>
      ))}
    </div>
  );
}

export default function HomeMarquee({ categories }) {
  const { t } = useTranslation();
  const items = categories;

  if (!items.length) return null;

  return (
    <section className="marquee-section" aria-label={t('home.featuredCollection')}>
      <div className="marquee">
        <div className="marquee-track">
          <MarqueeGroup items={items} t={t} groupKey="a" />
          <MarqueeGroup items={items} t={t} groupKey="clone" />
        </div>
      </div>
    </section>
  );
}

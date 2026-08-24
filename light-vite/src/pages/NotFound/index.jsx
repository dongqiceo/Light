import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <section className="not-found" aria-labelledby="not-found-title">
      <div className="not-found__glow" aria-hidden="true" />
      <div className="not-found__content">
        <span className="not-found__eyebrow">{t('notFound.eyebrow')}</span>
        <p className="not-found__code" aria-hidden="true">
          404
        </p>
        <h1 id="not-found-title">{t('notFound.title')}</h1>
        <p className="not-found__description">{t('notFound.description')}</p>
        <div className="not-found__actions">
          <Link className="btn-primary" to="/">
            {t('notFound.backHome')}
          </Link>
          <Link className="btn-outline" to="/products">
            {t('notFound.browseProducts')}
          </Link>
        </div>
      </div>
    </section>
  );
}

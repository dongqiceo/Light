import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useProductCategories } from '../../hooks/useProductCategories';
import { useGsapPage } from '../../hooks/useGsapPage';
import PageHero from '../../components/ui/PageHero';
import BackToTop from '../../components/ui/BackToTop';
import CategoryBlock from './CategoryBlock';

export default function Products() {
  const { t } = useTranslation();
  const pageRef = useRef(null);
  const { categories, loading } = useProductCategories();

  useGsapPage(
    pageRef,
    (gsap) => {
      if (loading) return;
      gsap.from('.page-hero-content', {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
      });
      gsap.utils.toArray('.category-block').forEach((el, i) => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: 'top 88%' },
          y: 36,
          opacity: 0,
          duration: 0.7,
          delay: i * 0.05,
          ease: 'power2.out',
        });
      });
    },
    [loading],
  );

  return (
    <div className="products-page" ref={pageRef}>
      <PageHero title={t('products.title')} subtitle={t('products.subtitle')} />

      <div className={`container page-body ${loading ? 'loading' : ''}`}>
        {categories.map((category) => (
          <CategoryBlock key={category.id || category.name} category={category} />
        ))}
      </div>

      <BackToTop />
    </div>
  );
}

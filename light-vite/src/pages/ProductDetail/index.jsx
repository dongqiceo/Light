import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProductDetail } from '../../hooks/useProductDetail';
import DetailGallery from './DetailGallery';
import DetailSpecs from './DetailSpecs';

export default function ProductDetail() {
  const { t } = useTranslation();
  const { categoryId, imageIndex } = useParams();
  const [searchParams] = useSearchParams();
  const byIndex = searchParams.get('byIndex') === '1';

  const {
    loading,
    name,
    description,
    price,
    folderName,
    images,
    currentIndex,
    setCurrentIndex,
    specs,
  } = useProductDetail(categoryId, imageIndex, byIndex);

  return (
    <div className={`detail-page ${loading ? 'loading' : ''}`}>
      <div className="detail-page-wrap">
        <Link to="/products" className="detail-back">
          ← {t('common.back')}
        </Link>

        <div className="detail-card">
          <div className="detail-grid">
            <DetailGallery
              name={name}
              images={images}
              folderName={folderName}
              currentIndex={currentIndex}
              onSelectImage={setCurrentIndex}
            />
            <DetailSpecs name={name} description={description} price={price} specs={specs} />
          </div>
        </div>
      </div>
    </div>
  );
}

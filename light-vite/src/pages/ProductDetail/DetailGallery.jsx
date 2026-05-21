import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getDetailImagePath } from '../../utils/product';

export default function DetailGallery({
  name,
  images,
  folderName,
  currentIndex,
  onSelectImage,
}) {
  const { t } = useTranslation();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const currentSrc = getDetailImagePath(images[currentIndex], folderName);

  useEffect(() => {
    if (!lightboxOpen) return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setLightboxOpen(false);
        return;
      }
      if (images.length <= 1) return;
      if (e.key === 'ArrowLeft') {
        onSelectImage((currentIndex - 1 + images.length) % images.length);
      }
      if (e.key === 'ArrowRight') {
        onSelectImage((currentIndex + 1) % images.length);
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [lightboxOpen, currentIndex, images.length, onSelectImage]);

  const goPrev = (e) => {
    e.stopPropagation();
    onSelectImage((currentIndex - 1 + images.length) % images.length);
  };

  const goNext = (e) => {
    e.stopPropagation();
    onSelectImage((currentIndex + 1) % images.length);
  };

  return (
    <div className="detail-gallery">
      <div className="detail-gallery-head">
        <span className="detail-chip">{t('products.title')}</span>
        {images.length > 1 && (
          <span className="detail-image-count">
            {currentIndex + 1} / {images.length}
          </span>
        )}
      </div>

      {images.length > 0 ? (
        <>
          <button
            type="button"
            className="detail-main detail-main-zoomable"
            onClick={() => setLightboxOpen(true)}
            aria-label={t('productDetail.enlargeImage')}
          >
            <img src={currentSrc} alt={name} />
          </button>
          {lightboxOpen && (
            <div
              className="detail-lightbox"
              role="dialog"
              aria-modal="true"
              aria-label={t('productDetail.enlargeImage')}
            >
              <button
                type="button"
                className="detail-lightbox-backdrop"
                onClick={() => setLightboxOpen(false)}
                aria-label={t('productDetail.closeLightbox')}
              />
              <button
                type="button"
                className="detail-lightbox-close"
                onClick={() => setLightboxOpen(false)}
                aria-label={t('productDetail.closeLightbox')}
              >
                ×
              </button>
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    className="detail-lightbox-nav prev"
                    onClick={goPrev}
                    aria-label={t('productDetail.previousImage')}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="detail-lightbox-nav next"
                    onClick={goNext}
                    aria-label={t('productDetail.nextImage')}
                  >
                    ›
                  </button>
                </>
              )}
              <div className="detail-lightbox-stage">
                <img className="detail-lightbox-img" src={currentSrc} alt={name} />
              </div>
            </div>
          )}
          {images.length > 1 && (
            <div className="detail-thumbs">
              {images.map((img, i) => (
                <button
                  key={`${img}-${i}`}
                  type="button"
                  className={i === currentIndex ? 'active' : ''}
                  onClick={() => onSelectImage(i)}
                >
                  <img src={getDetailImagePath(img, folderName)} alt={`${name} ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="detail-empty">No images</div>
      )}
    </div>
  );
}

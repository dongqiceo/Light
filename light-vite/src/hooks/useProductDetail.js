import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getProductDetail } from '../services';
import { mockProductCategories } from '../services/mockData';

export const DEFAULT_SPECS = {
  colors: [
    { name: 'Black', value: 'black', hex: '#1a1a1a' },
    { name: 'White', value: 'white', hex: '#ffffff' },
  ],
  sizes: [
    { label: '30cm', value: '30cm' },
    { label: '60cm', value: '60cm' },
  ],
  powers: [
    { label: '12W', value: '12W' },
    { label: '24W', value: '24W' },
  ],
  colorTemperatures: [
    { label: '3000K (Warm)', value: '3000K' },
    { label: '4000K (Neutral)', value: '4000K' },
  ],
};

function mapSpecsFromApi(s) {
  return {
    colors: (s.colors || []).map((c) => ({
      name: c.name || c.value,
      value: c.value || c.name,
      hex: c.hex || '#999',
    })),
    sizes: (s.sizes || []).map((sz) => ({
      label: sz.label ?? sz.value,
      value: sz.value ?? sz.label,
    })),
    powers: s.powers || DEFAULT_SPECS.powers,
    colorTemperatures: (s.colorTemperatures || []).map((ct) => ({
      label: ct.label ?? ct.value,
      value: ct.value ?? ct.label,
    })),
  };
}

function applyMockCategory(category, t, imgIndex, setters) {
  setters.setName(category.displayNameKey ? t(category.displayNameKey) : category.name);
  setters.setImages(category.images || []);
  setters.setFolderName(category.folderName || '磁吸轨道射灯');
  setters.setCurrentIndex(imgIndex);
}

export function useProductDetail(categoryId, imageIndex, byIndex) {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [folderName, setFolderName] = useState('磁吸轨道射灯');
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [specs, setSpecs] = useState(DEFAULT_SPECS);

  useEffect(() => {
    const catId = Number(categoryId);
    const segment = imageIndex;
    const productId = byIndex ? undefined : segment != null && segment !== '' ? Number(segment) : undefined;
    const imgIndex = byIndex ? Number(segment) || 0 : 0;

    if (!catId) return undefined;

    let cancelled = false;
    const mockSetters = { setName, setImages, setFolderName, setCurrentIndex };

    const load = async () => {
      setLoading(true);
      try {
        const res = await getProductDetail(catId, productId);
        if (cancelled) return;

        if (res?.data) {
          const d = res.data;
          setName(d.name || 'Product');
          setDescription(
            d.description ||
              'High-quality magnetic track lighting with adjustable angle and sleek modern design.',
          );
          setImages(Array.isArray(d.images) ? d.images : []);
          setFolderName(d.folderName || '磁吸轨道射灯');
          setPrice(d.price ?? 0);
          setSpecs(d.specifications ? mapSpecsFromApi(d.specifications) : DEFAULT_SPECS);
          setCurrentIndex(Math.min(imgIndex, (d.images?.length || 1) - 1));
        } else {
          const category = mockProductCategories.find((c) => c.id === catId);
          if (category) applyMockCategory(category, t, imgIndex, mockSetters);
        }
      } catch {
        if (cancelled) return;
        const category = mockProductCategories.find((c) => c.id === Number(categoryId));
        if (category) {
          applyMockCategory(category, t, byIndex ? Number(imageIndex) || 0 : 0, mockSetters);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [categoryId, imageIndex, byIndex, i18n.language, t]);

  return {
    loading,
    name,
    description,
    price,
    folderName,
    images,
    currentIndex,
    setCurrentIndex,
    specs,
  };
}

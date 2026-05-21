import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getFeaturedProducts, getProductCategories } from '../services';
import { mockFeaturedProducts, mockProductCategories } from '../services/mockData';

export function useHomeData() {
  const { i18n } = useTranslation();
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, catsRes] = await Promise.allSettled([
        getFeaturedProducts({ limit: 6 }),
        getProductCategories(),
      ]);

      setFeatured(
        productsRes.status === 'fulfilled' && productsRes.value?.data
          ? productsRes.value.data
          : mockFeaturedProducts,
      );
      setCategories(
        catsRes.status === 'fulfilled' && catsRes.value?.data
          ? catsRes.value.data
          : mockProductCategories,
      );
    } catch {
      setFeatured(mockFeaturedProducts);
      setCategories(mockProductCategories);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, i18n.language]);

  return { featured, categories, loading };
}

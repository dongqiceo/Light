import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getFeaturedProducts, getProductCategories } from '../services';

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
        productsRes.status === 'fulfilled' && Array.isArray(productsRes.value?.data)
          ? productsRes.value.data
          : [],
      );
      setCategories(
        catsRes.status === 'fulfilled' && Array.isArray(catsRes.value?.data)
          ? catsRes.value.data
          : [],
      );
    } catch {
      setFeatured([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, i18n.language]);

  return { featured, categories, loading };
}

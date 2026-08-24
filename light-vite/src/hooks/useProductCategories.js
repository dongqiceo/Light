import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getProductCategories } from '../services';

export function useProductCategories() {
  const { i18n } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getProductCategories();
        if (!cancelled) setCategories(Array.isArray(res?.data) ? res.data : []);
      } catch {
        if (!cancelled) setCategories([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    return () => {
      cancelled = true;
    };
  }, [i18n.language]);

  return { categories, loading };
}

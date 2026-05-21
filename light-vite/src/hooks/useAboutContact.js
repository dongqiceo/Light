import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getSiteSettings } from '../services';

export function useAboutContact() {
  const { t, i18n } = useTranslation();
  const [remote, setRemote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getSiteSettings()
      .then((res) => {
        if (!cancelled && (res.code === 200 || res.code === 0) && res.data) {
          setRemote(res.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [i18n.language]);

  const contact = {
    tagline: remote?.tagline || t('about.contact.tagline'),
    intro: remote?.intro || t('about.contact.intro'),
    address: remote?.address || t('about.contact.address'),
    email: remote?.email || t('about.contact.email'),
    phone: remote?.phone || t('about.contact.phone'),
    addressLabel: t('about.contact.addressLabel'),
    emailLabel: t('about.contact.emailLabel'),
    phoneLabel: t('about.contact.phoneLabel'),
  };

  return { contact, loading };
}

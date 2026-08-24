import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { changeLocale, getCurrentLocale, isRTL } from '../../i18n';
import { LANGS } from '../../constants/nav';
import Logo from '../Logo';

export default function Navbar({ isHome }) {
  const { t } = useTranslation();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [locale, setLocale] = useState(getCurrentLocale());
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);

  const active = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const solid = !isHome || scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    document.body.style.overflow = '';
  }, [location.pathname]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('click', onClickOutside);
    return () => document.removeEventListener('click', onClickOutside);
  }, []);

  const handleLang = (code) => {
    changeLocale(code);
    setLocale(code);
    setLangOpen(false);
    setMobileOpen(false);
    document.body.style.overflow = '';
  };

  const toggleMobile = () => {
    setMobileOpen((v) => {
      document.body.style.overflow = v ? '' : 'hidden';
      return !v;
    });
  };

  const navLink = (path, label) => (
    <Link
      to={path}
      className={`nav-link ${active(path) ? 'active' : ''}`}
    >
      {label}
    </Link>
  );

  const currentLang = LANGS.find((l) => l.code === locale) || LANGS[0];

  return (
    <>
    <header className={`navbar ${solid ? 'solid' : 'transparent'} ${isRTL(locale) ? 'rtl' : ''}`}>
      <div className="navbar-inner">
        <Logo size="sm" />

        <nav className="nav-desktop" aria-label="Main">
          {navLink('/', t('nav.home'))}
          {navLink('/products', t('nav.products'))}
          {navLink('/about', t('nav.about'))}
        </nav>

        <div className="nav-actions">
          <div className="lang-switch" ref={langRef}>
            <button
              type="button"
              className="lang-btn"
              onClick={() => setLangOpen((v) => !v)}
              aria-expanded={langOpen}
            >
              <span>{currentLang.flag}</span>
              <span className="lang-label">{currentLang.label}</span>
            </button>
            {langOpen && (
              <ul className="lang-menu">
                {LANGS.map((lang) => (
                  <li key={lang.code}>
                    <button
                      type="button"
                      className={locale === lang.code ? 'active' : ''}
                      onClick={() => handleLang(lang.code)}
                    >
                      <span>{lang.flag}</span> {lang.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="button"
            className={`hamburger ${mobileOpen ? 'open' : ''}`}
            onClick={toggleMobile}
            aria-label="Menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>

      <div className={`mobile-drawer ${mobileOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-backdrop" onClick={toggleMobile} />
        <div className="mobile-drawer-panel">
          <div className="mobile-drawer-head">
            <Logo size="sm" onClick={toggleMobile} />
            <button type="button" className="close-btn" onClick={toggleMobile} aria-label="Close">
              ×
            </button>
          </div>
          <nav className="mobile-nav">
            {navLink('/', t('nav.home'))}
            {navLink('/products', t('nav.products'))}
            {navLink('/about', t('nav.about'))}
          </nav>
          <div className="mobile-lang">
            {LANGS.map((lang) => (
              <button
                key={lang.code}
                type="button"
                className={locale === lang.code ? 'active' : ''}
                onClick={() => handleLang(lang.code)}
              >
                {lang.flag} {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

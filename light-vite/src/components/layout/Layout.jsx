import { useLayoutEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingContactFab from './FloatingContactFab';

export default function Layout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <div className="app">
      <Navbar isHome={isHome} />
      <main className="main">
        <Outlet />
      </main>
      <Footer />
      <FloatingContactFab />
    </div>
  );
}

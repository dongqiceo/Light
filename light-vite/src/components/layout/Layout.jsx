import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingContactFab from './FloatingContactFab';

export default function Layout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

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

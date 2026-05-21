import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Home from '../pages/Home';
import Products from '../pages/Products';
import ProductDetail from '../pages/ProductDetail';
import About from '../pages/About';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'products', element: <Products /> },
      { path: 'products/:categoryId/:imageIndex', element: <ProductDetail /> },
      { path: 'product/:id', element: <ProductDetail /> },
      { path: 'about', element: <About /> },
    ],
  },
]);

export default router;

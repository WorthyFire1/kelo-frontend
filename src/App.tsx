import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { AdminRoute } from '@/components/admin/AdminRoute';
import { AboutPage } from '@/pages/AboutPage';
import { AccountPage } from '@/pages/AccountPage';
import { ArticlePage } from '@/pages/ArticlePage';
import { BlogPage } from '@/pages/BlogPage';
import { BrandsPage } from '@/pages/BrandsPage';
import { CartPage } from '@/pages/CartPage';
import { CatalogPage } from '@/pages/CatalogPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { ContactsPage } from '@/pages/ContactsPage';
import { CustomOrderPage } from '@/pages/CustomOrderPage';
import { DeliveryPage } from '@/pages/DeliveryPage';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { PoliciesPage } from '@/pages/PoliciesPage';
import { ProductPage } from '@/pages/ProductPage';
import { PromotionsPage } from '@/pages/PromotionsPage';
import { SearchPage } from '@/pages/SearchPage';
import { AdminPage } from '@/pages/AdminPage';

const router = createBrowserRouter([
  {
    path: '/admin',
    element: <AdminRoute><AdminPage /></AdminRoute>,
  },
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/catalog', element: <CatalogPage /> },
      { path: '/catalog/:slug', element: <ProductPage /> },
      { path: '/promotions', element: <PromotionsPage /> },
      { path: '/custom-order', element: <CustomOrderPage /> },
      { path: '/blog', element: <BlogPage /> },
      { path: '/blog/:slug', element: <ArticlePage /> },
      { path: '/brands', element: <BrandsPage /> },
      { path: '/delivery', element: <DeliveryPage /> },
      { path: '/about', element: <AboutPage /> },
      { path: '/contacts', element: <ContactsPage /> },
      { path: '/search', element: <SearchPage /> },
      { path: '/cart', element: <CartPage /> },
      { path: '/favorites', element: <FavoritesPage /> },
      { path: '/checkout', element: <CheckoutPage /> },
      { path: '/account', element: <AccountPage /> },
      { path: '/policies/:type', element: <PoliciesPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}

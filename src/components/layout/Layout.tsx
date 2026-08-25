import { Outlet, ScrollRestoration } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export function Layout() {
  return (
    <>
      <Header />
      <main className="site-main"><Outlet /></main>
      <Footer />
      <ScrollRestoration />
    </>
  );
}

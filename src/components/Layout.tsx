import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* الخلفيات الثابتة ... */}
      <Header />

      <main className={`flex-grow relative z-[1] ${isHome ? '' : 'pt-20 md:pt-24'}`}>
        {children}
      </main>

      <Footer />
    </div>
  );
}

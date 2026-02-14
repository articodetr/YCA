import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen relative">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[750px] md:h-[750px] lg:w-[900px] lg:h-[900px] opacity-[0.04]"
          style={{
            backgroundImage: 'url(/backG.png)',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/40" />
        <div
          className="absolute top-0 right-0 w-16 h-full opacity-[0.06]"
          style={{
            backgroundImage: 'url(/yca_golden_belt_transparent_clean_v2.png)',
            backgroundRepeat: 'repeat-y',
            backgroundSize: '100% auto',
          }}
        />
        <div
          className="absolute top-0 left-0 w-16 h-full opacity-[0.04]"
          style={{
            backgroundImage: 'url(/yca_golden_belt_transparent_clean_v2.png)',
            backgroundRepeat: 'repeat-y',
            backgroundSize: '100% auto',
          }}
        />
      </div>
      <Header />
      <main className={`flex-grow relative z-[1] ${isHomePage ? '' : 'pt-20 md:pt-24'}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}

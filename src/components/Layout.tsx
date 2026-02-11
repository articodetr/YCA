import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen relative">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-[0.028]"
          style={{
            backgroundImage: 'url(/backG.png)',
            backgroundRepeat: 'repeat',
            backgroundSize: '320px 320px',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white/60" />
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
      <main className="flex-grow pt-20 md:pt-24 relative z-[1]">
        {children}
      </main>
      <Footer />
    </div>
  );
}

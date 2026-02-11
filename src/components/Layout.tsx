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
        <img
          src="/logo_white.png"
          alt=""
          className="absolute -right-10 top-32 w-[550px] h-[550px] object-contain opacity-[0.08]"
          style={{ filter: 'brightness(0) sepia(1) saturate(2) hue-rotate(15deg) opacity(0.6)' }}
        />
        <img
          src="/logo_white.png"
          alt=""
          className="absolute -left-16 bottom-32 w-[450px] h-[450px] object-contain opacity-[0.06] rotate-12"
          style={{ filter: 'brightness(0) sepia(1) saturate(2) hue-rotate(15deg) opacity(0.6)' }}
        />
        <div
          className="absolute top-0 right-0 w-20 h-full opacity-[0.08]"
          style={{
            backgroundImage: 'url(/yca_golden_belt_transparent_clean_v2.png)',
            backgroundRepeat: 'repeat-y',
            backgroundSize: '100% auto',
          }}
        />
        <div
          className="absolute top-0 left-0 w-20 h-full opacity-[0.06]"
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

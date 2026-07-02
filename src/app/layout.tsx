import type { Metadata } from 'next';
import { Outfit, Playfair_Display } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Chatbot from '@/components/Chatbot';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DosaHub - Authentic South Indian Food Delivery',
  description: 'Order hot, crispy ghee roasts, fluffy idlis, and traditional filter coffee from DosaHub. Fast, authentic, and premium food delivery.',
  keywords: 'DosaHub, South Indian Food, Food Delivery, Dosa, Idli, Filter Coffee, Bengaluru',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${playfair.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{__html: `
          try {
            if (localStorage.getItem('dh_theme') === 'dark') {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          } catch (_) {}
        `}} />
      </head>
      <body className="flex min-h-screen flex-col bg-cream-100 text-temple-900 dark:bg-coffee-950 dark:text-cream-100 antialiased">
        <AppProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <Chatbot />
        </AppProvider>
      </body>
    </html>
  );
}

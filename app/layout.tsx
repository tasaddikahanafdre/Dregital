import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/lib/CartContext';
import { WishlistProvider } from '@/lib/WishlistContext';
import LayoutShell from '@/components/LayoutShell';

export const metadata: Metadata = {
  title: {
    default: 'Dregital',
    template: '%s | Dregital',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  description: 'Shop authentic technology, computer accessories, ANC headphones, TWS earbuds, GaN fast chargers, smart devices and daily tech essentials in Bangladesh with cash on delivery.',
  keywords: 'Dregital, Bangladesh ecommerce, gadgets, tech shop Dhaka, computer accessories, earbuds, smart watch',
  openGraph: {
    title: 'Dregital',
    description: 'Shop authentic technology, audio gear, smart gadgets, and computer accessories in Bangladesh.',
    url: 'https://dregital.com',
    siteName: 'Dregital',
    locale: 'en_BD',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-black min-h-screen">
        <CartProvider>
          <WishlistProvider>
            <LayoutShell>
              {children}
            </LayoutShell>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}

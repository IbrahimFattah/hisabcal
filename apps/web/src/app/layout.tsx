import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/providers/AuthProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';

export const metadata: Metadata = {
  title: 'HisabCal - Calorie Banking System',
  description: 'Track calories, earn points, and save for special occasions',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'HisabCal',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Inline script to prevent flash: apply dark class before paint */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){try{var t=localStorage.getItem('fitbank-theme');
          if(t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme:dark)').matches))
          document.documentElement.classList.add('dark')}catch(e){}})();
        `}} />
      </head>
      <body className="bg-gray-50 dark:bg-surface-950 text-gray-900 dark:text-gray-100 antialiased overscroll-none">
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClientPatch } from '@/components/common/ClientPatch';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'UTH 3D Map - Hệ Thống Dẫn Đường Thông Minh',
  description:
    'Hệ thống dẫn đường 3D từng bước (Step-by-step) trong khuôn viên Đại học Giao thông vận tải TP.HCM (UTH) qua mã QR.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0f172a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="h-full bg-slate-950 text-slate-100">
      <body className={`${inter.className} h-full overflow-hidden select-none antialiased`}>
        <ClientPatch />
        {children}
      </body>
    </html>
  );
}

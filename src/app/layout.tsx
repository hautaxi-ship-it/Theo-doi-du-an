import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';

export const metadata: Metadata = {
  title: 'Hệ thống Quản trị Đơn hàng & Sản xuất Khối Cơ khí - TBCD',
  description: 'Hệ thống quản trị tập trung chuỗi sản xuất đa nhà máy: THCK, TBCD, NMK',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="bg-slate-100 text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}

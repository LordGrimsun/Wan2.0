import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Wan 2.0 Studio — Open Source AI Video, Image & Audio Generator',
  description: 'Next-Gen Generative AI Super App powered by Wan 2.1, HunyuanVideo, MiniMax, Flux, and LTX-Video. Fast, intuitive, and accessible to everyone.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#08090d] text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        {children}
      </body>
    </html>
  );
}

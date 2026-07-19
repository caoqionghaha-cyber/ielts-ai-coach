import type { Metadata } from "next";
import "./globals.css";
import "./custom.css";

export const metadata: Metadata = {
  icons: {
    icon: '/logo.svg',
    apple: '/logo.svg',
  },
  title: "IELTS AI Coach - AI雅思写作私人教练",
  description: "基于AI的IELTS Writing个性化训练系统",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:opsz,wght@6..12,300;6..12,400;6..12,500;6..12,600;6..12,700;6..12,800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}

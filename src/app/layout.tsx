import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ایستگاه دندان | معرفی دندانپزشکی‌های ایران",
    template: "%s | ایستگاه دندان",
  },
  description:
    "ایستگاه دندان - معرفی بهترین دندانپزشکی‌ها در سراسر ایران. خدمات ایمپلنت، ارتودنسی، روکش دندان و...",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://istgahedandan.ir"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: "ایستگاه دندان",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}

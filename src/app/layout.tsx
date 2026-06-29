import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-vazirmatn",
  display: "swap",
});

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
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: "ایستگاه دندان",
    images: [{ url: "/assets/og-default.jpg", width: 1200, height: 630, alt: "ایستگاه دندان" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@istgahedandan",
    images: ["/assets/og-default.jpg"],
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || "https://istgahedandan.ir",
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
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body style={{ fontFamily: "var(--font-vazirmatn), Tahoma, Arial, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}

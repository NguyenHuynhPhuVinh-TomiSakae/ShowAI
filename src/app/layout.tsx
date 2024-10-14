import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import NavFooter from "@/components/NavFooter";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { BiLoaderAlt } from "react-icons/bi";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "ShowAI - Khám Phá Công Cụ AI Tốt Nhất",
  description: "Tìm kiếm và khám phá các công cụ AI hàng đầu tại ShowAI. Giúp bạn tìm ứng dụng AI phù hợp với nhu cầu của mình.",
  keywords: "AI, công cụ AI, ứng dụng AI, trí tuệ nhân tạo, ShowAI",
  openGraph: {
    title: "ShowAI - Khám Phá và So Sánh Công Cụ AI Tốt Nhất | Tìm Kiếm AI Miễn Phí",
    description: "Tìm kiếm, so sánh và khám phá các công cụ AI hàng đầu miễn phí tại ShowAI. Tối ưu công việc và cuộc sống với AI.",
    images: [{ url: "/logo.jpg", width: 1200, height: 630, alt: "ShowAI Logo" }],
    type: "website",
    locale: "vi_VN",
    url: "https://showai.vercel.app",
  },
  verification: {
    google: "A3b1gdpqs1J6C0eaFwp9BcA9_e5mVfUjqLTAgo25ztc",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#1A1A2E] text-gray-200`}
      >
        <NavFooter>
          {children}
          <div className="absolute inset-0 flex items-center justify-center bg-[#1A1A2E] -z-10">
            <div className="animate-spin">
              <BiLoaderAlt className="w-16 h-16 text-[#4ECCA3] animate-spin" />
            </div>
          </div>
        </NavFooter>
        <ScrollToTopButton />
        <div id="modal-root"></div>
        <Script
          src="/live2d/core/live2dcubismcore.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="/live2d/core/live2d.min.js"
          strategy="beforeInteractive"
        />
        <Script id="structured-data" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "ShowAI",
            "url": "https://showai.vercel.app",
            "description": "Khám phá và so sánh công cụ AI tốt nhất, miễn phí",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://showai.vercel.app/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </Script>
      </body>
    </html>
  );
}

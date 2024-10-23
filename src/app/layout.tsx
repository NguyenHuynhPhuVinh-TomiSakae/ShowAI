import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import NavFooter from "@/components/NavFooter";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import GeminiChatIcon from "@/components/GeminiChatIcon";
import { Toaster } from '@/components/ui/toaster'
import { Analytics } from "@vercel/analytics/react"
import VoiceCallIcon from "@/components/VoiceCallIcon";
import { SpeedInsights } from '@vercel/speed-insights/next';

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
    google: "ULMnsGmjmo7o0bGjwjkW7UDPlGKwJii5L8t6nOtJ49o",
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
        <Analytics />
        <SpeedInsights />
        <NavFooter>
          {children}
          <Toaster />
          <div className="fixed inset-0 flex items-center justify-center bg-[#1A1A2E] -z-10">
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 border border-[#4ECCA3] rounded-full animate-[pulse_1.5s_ease-in-out_infinite]"></div>
              <div className="absolute inset-2 bg-[#4ECCA3] bg-opacity-5 rounded-full"></div>
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#4ECCA3" strokeWidth="0.3">
                  <animate attributeName="r" values="35;45;35" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle cx="50" cy="50" r="30" fill="none" stroke="#4ECCA3" strokeWidth="0.3">
                  <animate attributeName="r" values="25;35;25" dur="3s" repeatCount="indefinite" />
                </circle>
                <line x1="50" y1="50" x2="50" y2="100" stroke="#4ECCA3" strokeWidth="0.5">
                  <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="4s" repeatCount="indefinite" />
                </line>
              </svg>
            </div>
          </div>
        </NavFooter>
        <ScrollToTopButton />
        <GeminiChatIcon />
        <VoiceCallIcon />
        <div id="modal-root"></div>
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

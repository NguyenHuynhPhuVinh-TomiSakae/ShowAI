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
import OpenReplayTracker from '@/components/OpenReplayTracker';
import AIInteractionToggle from "@/components/AIInteractionToggle";
import LoadingProvider from "@/components/LoadingProvider";
import ClientPathCheck from '@/components/ClientPathCheck';

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
    url: "https://showai.io.vn",
  },
  verification: {
    google: "ULMnsGmjmo7o0bGjwjkW7UDPlGKwJii5L8t6nOtJ49o",
    other: {
      'zalo-platform-site-verification': 'MjI_0fd25pXcie8mkuTI4q6g-KIjt2aIC3Cr'
    }
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
        <LoadingProvider>
          <ClientPathCheck />
          <Analytics />
          <SpeedInsights />
          <OpenReplayTracker />
          <NavFooter>
            {children}
            <Toaster />
          </NavFooter>
          <ScrollToTopButton />
          <GeminiChatIcon />
          <VoiceCallIcon />
          <AIInteractionToggle />
          <div id="modal-root"></div>
        </LoadingProvider>
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

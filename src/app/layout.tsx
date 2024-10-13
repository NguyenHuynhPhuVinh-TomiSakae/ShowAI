import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import NavFooter from "@/components/NavFooter";
import ScrollToTopButton from "@/components/ScrollToTopButton";

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
  title: "ShowAI",
  description: "Giới thiệu các trang web AI nhằm hỗ trợ việc tìm kiếm AI phục vụ cho công việc hằng ngày.",
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
              <svg className="w-16 h-16 text-[#4ECCA3] animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
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
      </body>
    </html>
  );
}

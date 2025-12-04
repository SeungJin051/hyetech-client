import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "혜테크 - 잠자고 있는 내 지원금 찾기",
  description:
    "청년을 위한 맞춤형 지원금 검색 서비스. 거주지, 나이, 성별만 입력하면 받을 수 있는 모든 혜택을 한눈에!",
  keywords: [
    "청년지원금",
    "청년혜택",
    "정부지원금",
    "청년정책",
    "월세지원",
    "취업지원",
    "청년도약계좌",
  ],
  authors: [
    {
      name: "Hyetech Team",
    },
  ],
  openGraph: {
    title: "혜테크 - 잠자고 있는 내 지원금 찾기",
    description: "내가 받을 수 있는 청년 지원금을 찾아보세요!",
    type: "website",
    locale: "ko_KR",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}

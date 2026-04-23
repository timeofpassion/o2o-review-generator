import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "O2O 리뷰 원고 생성기",
  description: "네이버플레이스 · 구글맵 · 카카오맵 병원 리뷰 원고를 AI가 생성합니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className="min-h-dvh flex flex-col">{children}</body>
    </html>
  );
}

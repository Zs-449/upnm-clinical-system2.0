import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "UPNM Smart Clinical System v2.0",
  description:
    "Military Precision meets Modern Healthcare — UPNM Smart Clinical System (SCS) v2.0",
  icons: { icon: "/images/upnm-logo.png" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Poppins:wght@600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.theme==='dark'||(!('theme'in localStorage)&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}`,
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}

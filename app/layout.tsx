import type { Metadata, Viewport } from "next";
import { Funnel_Display, Funnel_Sans, Geist_Mono } from "next/font/google";
import { applyThemeBeforePaint } from "./components/landing/landingTheme";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const landingDisplay = Funnel_Display({
  variable: "--font-landing-display",
  subsets: ["latin"],
});

const landingSans = Funnel_Sans({
  variable: "--font-landing-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://byldit.vercel.app"),
  title: "Byldit",
  description:
    "Turn your GitHub into a developer portfolio. Sign in, choose the repositories to show, and your page is live at your username.",
  icons: "/landing/byldit-mark-mono.webp",
  openGraph: {
    title: "Byldit — Turn your GitHub into a portfolio",
    description: "Sign in, choose the repositories to show, and your page is live at your username. No code, no hosting.",
    url: "https://byldit.vercel.app",
    siteName: "Byldit",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Byldit developer portfolio preview" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Byldit — Turn your GitHub into a portfolio",
    description: "Sign in, choose the repositories to show, and your page is live at your username. No code, no hosting.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The theme script below adds data-lp-theme to <html> before React hydrates it.
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistMono.variable} ${landingDisplay.variable} ${landingSans.variable} antialiased`}
      >
        <script dangerouslySetInnerHTML={{ __html: applyThemeBeforePaint }} />
        {children}
      </body>
    </html>
  );
}

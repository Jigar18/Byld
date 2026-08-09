import type { Metadata, Viewport } from "next";
import {
  Geist,
  Geist_Mono,
  Kaushan_Script,
  Manrope,
  Sora,
} from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const loaderMark = Kaushan_Script({
  variable: "--font-loader-mark",
  subsets: ["latin"],
  weight: ["400"],
});

const profileBody = Manrope({
  variable: "--font-profile-body",
  subsets: ["latin"],
});

const profileDisplay = Sora({
  variable: "--font-profile-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://byldit.vercel.app"),
  title: "Byldit — Your GitHub shows the code. Your portfolio tells the story.",
  description:
    "Bring your projects, GitHub contributions, skills, and experience into one developer portfolio built to be explored.",
  icons: "/landing/byldit-mark-mono.webp",
  openGraph: {
    title: "Byldit — Give your work a place to speak",
    description: "Build a developer portfolio from the work already living on your GitHub.",
    url: "https://byldit.vercel.app",
    siteName: "Byldit",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Byldit developer portfolio preview" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Byldit — Give your work a place to speak",
    description: "Build a developer portfolio from the work already living on your GitHub.",
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${loaderMark.variable} ${profileBody.variable} ${profileDisplay.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

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
  openGraph: {
    title: "Byldit — Your GitHub shows the code. Your portfolio tells the story.",
    description:
      "Bring your projects, GitHub contributions, skills, and experience into one developer portfolio built to be explored.",
    url: "https://byldit.vercel.app",
    siteName: "Byldit",
    type: "website",
  },
  icons: "/tab-icon.png",
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

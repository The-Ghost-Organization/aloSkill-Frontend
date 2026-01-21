import { hindSiliguri, inter, playfair } from "@/styles/fonts.ts";
import type { Metadata } from "next";
import "./globals.css";
// import AuthProvider from "./providers/session-provider.tsx";
import { SessionProvider } from './contexts/SessionContext.tsx';

export const metadata: Metadata = {
  metadataBase: new URL("https://aloskill.com"),
  title: {
    default: "আলো স্কিল - Start Learning Today",
    template: "%s | আলো স্কিল",
  },
  description: "Master in-demand skills and discover great books — all in one platform, in Bangla.",
  keywords: ["learning", "education", "bangla", "courses", "books", "bangladesh"],
  authors: [{ name: "Alo Skill", url: "https://aloskill.com" }],
  creator: "Alo Skill",
  publisher: "Alo Skill",
  openGraph: {
    type: "website",
    locale: "bn_BD",
    url: "https://aloskill.com",
    title: "আলো স্কিল - Start Learning Today",
    description:
      "Master in-demand skills and discover great books — all in one platform, in Bangla.",
    siteName: "আলো স্কিল",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "আলো স্কিল",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "আলো স্কিল - Start Learning Today",
    description:
      "Master in-demand skills and discover great books — all in one platform, in Bangla.",
    images: ["/twitter-image.jpg"],
    creator: "@aloskill",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`antialiased ${inter.variable} ${playfair.variable} ${hindSiliguri.variable}`}
        style={
          {
            "--font-body": "var(--font-inter)",
            "--font-heading": "var(--font-playfair)",
            "--font-bangla": "var(--font-hind)",
          } as React.CSSProperties
        }
      >
        {/* <AuthProvider>
          <main>{children}</main>
        </AuthProvider> */}
        <SessionProvider>
          <main>{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}

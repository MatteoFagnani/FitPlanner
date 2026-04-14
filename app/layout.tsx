import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import AuthGuard from "@/components/layout/AuthGuard";
import PageTransition from "@/components/layout/PageTransition";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: '--font-outfit',
  display: "swap",
});

export const metadata: Metadata = {
  title: "FitPlanner - Kinetic Ledger",
  description: "Advanced Training Management Protocol",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={`${inter.variable} ${outfit.variable} antialiased`}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0&display=swap"
        />
      </head>
      <body className="font-sans bg-background text-on-surface min-h-screen selection:bg-primary/20">
        {/* Technical Background Grid */}
        <div className="fixed inset-0 z-[-1] opacity-[0.03] pointer-events-none overflow-hidden">
          <div className="absolute inset-0" style={{ 
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }} />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background to-background" />
        </div>

        <AuthGuard>
          <PageTransition>{children}</PageTransition>
        </AuthGuard>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Default metadata — the actual title is set dynamically from CMS settings in page.tsx via useEffect
export const metadata: Metadata = {
  title: "Portfolio",
  description: "Professional Portfolio Website",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-zinc-950 text-white`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}

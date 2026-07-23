import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: { default: "Dishly - Food Delivery", template: "%s | Dishly" },
  description: "Order food from thousands of restaurants near you. Fast delivery, great prices.",
  keywords: ["food delivery", "restaurants", "order food online", "dishly"],
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Dishly",
    title: "Dishly - Food Delivery",
    description: "Order food from thousands of restaurants near you.",
  },
  twitter: { card: "summary_large_image", title: "Dishly", description: "Order food from thousands of restaurants near you." },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

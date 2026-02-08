import type { Metadata } from "next";

import { Geist, Geist_Mono } from "next/font/google";

import "../index.css";
import Providers from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Elevated - College Admissions Consulting and Writing Tutoring",
    template: "%s | Elevated",
  },
  description:
    "Elevated helps students tell the best stories of their lives, with 920+ Top 20 college acceptances & 200+ writing prizes since 2020. Schedule a free intro call today for help with college admissions and/or writing tutoring!",
  icons: {
    icon: "/elevated-logo.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Elevated",
    title: "Elevated - College Admissions Consulting and Writing Tutoring",
    description:
      "Elevated helps students tell the best stories of their lives, with 920+ Top 20 college acceptances & 200+ writing prizes since 2020.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elevated - College Admissions Consulting",
    description:
      "920+ Top 20 college acceptances & 200+ writing prizes since 2020. Help students tell the best stories of their lives.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="grid h-svh grid-rows-[auto_1fr]">{children}</div>
        </Providers>
      </body>
    </html>
  );
}

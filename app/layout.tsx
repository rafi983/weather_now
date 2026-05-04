import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const dmSans = localFont({
  src: "../assets/fonts/DM_Sans/DMSans-VariableFont_opsz,wght.ttf",
  variable: "--font-dm-sans",
  display: "swap",
});

const bricolageGrotesque = localFont({
  src: "../assets/fonts/Bricolage_Grotesque/BricolageGrotesque-VariableFont_opsz,wdth,wght.ttf",
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SkyLuxe Weather | Elegant Forecasts",
  description:
    "SkyLuxe Weather provides current conditions, daily outlooks, and hourly forecasts with flexible unit controls.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${bricolageGrotesque.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { Bungee, Saira } from "next/font/google";
import "./globals.css";

export const runtime = "nodejs";

const bungee = Bungee({
  variable: "--font-bungee",
  subsets: ["latin"],
  weight: "400",
});

const saira = Saira({
  variable: "--font-saira",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "TITAN // Teen Goals Level Up",
  description:
    "Mobile-first quest dashboard for gamified teen goals, daily streaks, monthly bosses, and rewards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${bungee.variable} ${saira.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

import { headers } from "next/headers";
import { Bungee, Saira } from "next/font/google";

import { LOCALE_HEADER, resolveLocale } from "@/lib/i18n";

import "./globals.css";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): Promise<React.JSX.Element> {
  const headerStore = await headers();
  const locale = resolveLocale(headerStore.get(LOCALE_HEADER));

  return (
    <html
      lang={locale}
      className={`${bungee.variable} ${saira.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

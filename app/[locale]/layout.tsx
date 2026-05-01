import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getMessages, isSupportedLocale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    return {};
  }

  const messages = getMessages(locale);

  return {
    title: messages.meta.title,
    description: messages.meta.description,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>): Promise<React.JSX.Element> {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  return <>{children}</>;
}

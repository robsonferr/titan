import { notFound } from "next/navigation";

import { isSupportedLocale } from "@/lib/i18n";

import { renderTitanPage } from "../render-titan-page";

export const dynamic = "force-dynamic";

export default async function LocalizedBossPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<React.JSX.Element> {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  return renderTitanPage(locale, "boss");
}

import { redirect } from "next/navigation";

import { buildLocalizedPath, DEFAULT_LOCALE } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function Home() {
  redirect(buildLocalizedPath(DEFAULT_LOCALE));
}

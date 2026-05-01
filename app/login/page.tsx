import { redirect } from "next/navigation";

import { buildLocalizedPath, DEFAULT_LOCALE } from "@/lib/i18n";

export const dynamic = "force-dynamic";

function toQueryString(
  params: Record<string, string | string[] | undefined>,
): string {
  const nextParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") {
      nextParams.set(key, value);
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        nextParams.append(key, item);
      }
    }
  }

  const query = nextParams.toString();
  return query ? `?${query}` : "";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<never> {
  const params = await searchParams;
  redirect(`${buildLocalizedPath(DEFAULT_LOCALE, "/login")}${toQueryString(params)}`);
}

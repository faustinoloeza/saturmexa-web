import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getRoutes } from "@/lib/routes";
import RouteExplorer from "@/components/RouteExplorer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "RoutesPage" });
  return { title: t("metaTitle") };
}

export default async function RoutesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  let routes;
  try {
    routes = await getRoutes();
  } catch {
    const t = await getTranslations("RoutesPage");
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-error">{t("loadError")}</p>
      </div>
    );
  }

  return <RouteExplorer routes={routes} />;
}

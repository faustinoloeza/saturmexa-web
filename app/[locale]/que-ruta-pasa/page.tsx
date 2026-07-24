import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getRoutes } from "@/lib/routes";
import RouteMatcherWrapper from "@/components/RouteMatcherWrapper";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "QueRutaPasaPage" });
  return { title: t("metaTitle") };
}

export default async function QueRutaPasaPage({
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
    const t = await getTranslations("QueRutaPasaPage");
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-error">{t("loadError")}</p>
      </div>
    );
  }

  return <RouteMatcherWrapper routes={routes} />;
}

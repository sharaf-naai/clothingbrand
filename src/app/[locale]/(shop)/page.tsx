import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";

export default function Home({ params }: PageProps<"/[locale]">) {
  setRequestLocale(use(params).locale);
  const t = useTranslations("home");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
      <h1 className="font-serif text-6xl tracking-tight">VEYL</h1>
      <p className="text-sm text-grey">{t("comingSoon")}</p>
    </main>
  );
}

import type { Metadata } from "next";

import MovendoApp from "@/components/movendo-app";

export const metadata: Metadata = {
  title: "Aktywacja konta podopiecznego · FutureBody Trainer",
  description: "Utwórz konto podopiecznego za pomocą jednorazowego kodu od trenera.",
  openGraph: { images: [] },
  twitter: { images: [] },
};

export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <MovendoApp initialActivationCode={code} />;
}

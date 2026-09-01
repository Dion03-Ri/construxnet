import ComingSoon from "@/components/ComingSoon";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Obtanet — Coming Soon",
  description: "Die Plattform für die Baubranche. Sei unter den Ersten.",
};

export default async function ComingSoonPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return <ComingSoon accessError={error === "1"} />;
}

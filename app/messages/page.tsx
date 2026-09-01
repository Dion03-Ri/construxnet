import ChatWindow from "@/components/ChatWindow";
import { requireCompanyOrOnboard } from "@/lib/company";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Nachrichten · Obtanet",
  description: "Direktnachrichten und Verhandlungen zwischen verbundenen Firmen",
};

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ to?: string }>;
}) {
  await requireCompanyOrOnboard();
  const { to } = await searchParams;

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <ChatWindow initialTo={to} />
    </main>
  );
}

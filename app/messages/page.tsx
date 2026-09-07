import ChatWindow from "@/components/ChatWindow";
import { requireCompanyOrOnboard } from "@/lib/company";
import { SHELL } from "@/lib/ui";
import { cn } from "@/lib/utils";

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
    <main className={cn(SHELL, "py-6")}>
      <ChatWindow initialTo={to} />
    </main>
  );
}

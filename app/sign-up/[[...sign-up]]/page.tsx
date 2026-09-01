import { SignUp } from "@clerk/nextjs";

export const metadata = { title: "Registrieren · Obtanet" };

export default function SignUpPage() {
  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <SignUp />
    </main>
  );
}

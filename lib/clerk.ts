import { deDE } from "@clerk/localizations";
import type { Appearance } from "@clerk/types";

/**
 * Deutsche Clerk-Lokalisierung mit ConstruxNet-eigenem Wording.
 * Überschreibt die Titel/Untertitel, damit NICHT der geteilte App-Name
 * ("SourceOn") erscheint, sondern "ConstruxNet".
 */
export const clerkLocalization = {
  ...deDE,
  signIn: {
    ...deDE.signIn,
    start: {
      ...deDE.signIn?.start,
      title: "Anmelden bei ConstruxNet",
      subtitle: "Willkommen zurück im B2B-Netzwerk der Baubranche",
    },
  },
  signUp: {
    ...deDE.signUp,
    start: {
      ...deDE.signUp?.start,
      title: "ConstruxNet-Konto erstellen",
      subtitle: "Werde Teil des B2B-Netzwerks der Schweizer Baubranche",
    },
  },
};

/**
 * Heller Soft-Glass-Look für alle Clerk-Komponenten.
 */
export const clerkAppearance: Appearance = {
  variables: {
    colorPrimary: "#F97316", // Brand-Orange
    colorBackground: "#FFFFFF",
    colorInputBackground: "#FFFFFF",
    colorInputText: "#0F172A",
    colorText: "#0F172A",
    colorTextSecondary: "#64748B",
    colorTextOnPrimaryBackground: "#FFFFFF",
    colorDanger: "#E11D48",
    colorSuccess: "#10B981",
    borderRadius: "0.9rem",
  },
  elements: {
    card: "border border-slate-200 shadow-xl shadow-slate-900/5",
    formButtonPrimary:
      "bg-brand hover:bg-brand-600 transition-colors normal-case",
    footerActionLink: "text-brand hover:text-brand-600",
  },
};

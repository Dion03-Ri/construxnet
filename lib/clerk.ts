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
 * Navy/Orange-Look für alle Clerk-Komponenten (kein Standard-Weiss).
 */
export const clerkAppearance: Appearance = {
  variables: {
    colorPrimary: "#F97316", // Brand-Orange
    colorBackground: "#0F172A", // Navy-Card
    colorInputBackground: "#1E293B", // Navy-800
    colorInputText: "#F1F5F9",
    colorText: "#F1F5F9",
    colorTextSecondary: "#94A3B8",
    colorTextOnPrimaryBackground: "#FFFFFF",
    colorDanger: "#F43F5E",
    colorSuccess: "#10B981",
    borderRadius: "0.75rem",
  },
  elements: {
    card: "border border-white/10 shadow-2xl shadow-black/40",
    formButtonPrimary:
      "bg-brand hover:bg-brand-600 transition-colors normal-case",
    footerActionLink: "text-brand hover:text-brand-600",
  },
};

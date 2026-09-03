import LegalPage, { H2, P, UL, LI, Fill, Ref } from "@/components/legal/LegalPage";
import { LEGAL } from "@/data/legal";

export const metadata = {
  title: "Impressum · Obtanet",
  description: "Anbieterkennzeichnung nach Art. 3 Abs. 1 lit. s UWG.",
};

export default function ImpressumPage() {
  return (
    <LegalPage
      title="Impressum"
      lead="Wer hinter Obtanet steht und wie man uns erreicht."
      active="/impressum"
    >
      <H2>Betreiberin</H2>
      <P>
        <strong className="font-semibold text-white">
          <Fill value={LEGAL.betreiberin} />
        </strong>
        <br />
        <Fill value={LEGAL.strasse} />
        <br />
        <Fill value={LEGAL.plzOrt} />
        <br />
        {LEGAL.land}
      </P>

      <H2>Kontakt</H2>
      <P>
        E-Mail: <Fill value={LEGAL.email} />
        <br />
        Telefon: <Fill value={LEGAL.telefon} />
      </P>
      <P>
        Das Schweizer Recht verlangt bei Angeboten im elektronischen Geschäftsverkehr
        ausdrücklich eine E-Mail-Adresse; ein Kontaktformular allein genügt nicht.
        <Ref>Art. 3 Abs. 1 lit. s UWG</Ref>
      </P>

      <H2>Eintragung und Nummern</H2>
      <UL>
        <LI>
          Rechtsform: <Fill value={LEGAL.rechtsform} />
        </LI>
        <LI>
          Unternehmens-Identifikationsnummer (UID): <Fill value={LEGAL.uid} />
        </LI>
        <LI>
          Handelsregister: <Fill value={LEGAL.handelsregister} />
        </LI>
        <LI>
          Mehrwertsteuer: <Fill value={LEGAL.mwst} />
        </LI>
        <LI>
          Vertretungsberechtigt: <Fill value={LEGAL.vertretung} />
        </LI>
      </UL>

      <H2>Was Obtanet ist</H2>
      <P>
        Obtanet ist eine Plattform für die Schweizer Baubranche: Firmen vernetzen sich,
        melden ihren Materialbedarf und bündeln ihn, Baustoffwerke geben darauf verdeckte
        Angebote ab. Obtanet vermittelt zwischen den Beteiligten und wird nicht selbst
        Partei der Liefergeschäfte. Einzelheiten stehen in den{" "}
        <a href="/agb" className="font-medium text-brand hover:underline">
          Allgemeinen Geschäftsbedingungen
        </a>
        .
      </P>

      <H2>Haftung für Inhalte</H2>
      <P>
        Beiträge, Firmenprofile, Angebote und Nachrichten stammen von den Nutzerinnen und
        Nutzern der Plattform. Obtanet prüft sie nicht vorab auf Richtigkeit. Für eigene
        Inhalte — insbesondere Preisreihen, Materialangaben und Erklärtexte — bemühen wir
        uns um Sorgfalt, können aber keine Gewähr für Vollständigkeit und Aktualität
        übernehmen.
      </P>

      <H2>Verweise auf fremde Seiten</H2>
      <P>
        Diese Plattform verweist an einzelnen Stellen auf Seiten Dritter. Auf deren Inhalte
        haben wir keinen Einfluss und übernehmen dafür keine Verantwortung.
      </P>

      <H2>Urheberrecht</H2>
      <P>
        Aufbau, Texte, Gestaltung und Programmierung dieser Plattform sind urheberrechtlich
        geschützt. Inhalte, die Nutzerinnen und Nutzer einstellen, bleiben deren Eigentum;
        sie räumen Obtanet lediglich das Recht ein, sie im Rahmen des Betriebs
        darzustellen.
      </P>
    </LegalPage>
  );
}

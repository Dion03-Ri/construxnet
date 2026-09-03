import LegalPage, { H2, H3, P, UL, LI, Fill, Ref } from "@/components/legal/LegalPage";
import { LEGAL } from "@/data/legal";

export const metadata = {
  title: "Datenschutz · Obtanet",
  description: "Welche Daten Obtanet bearbeitet, wozu, wer sie erhält und welche Rechte du hast.",
};

export default function DatenschutzPage() {
  return (
    <LegalPage
      title="Datenschutzerklärung"
      lead="Welche Daten wir bearbeiten, wozu, wer sie erhält und welche Rechte du hast."
      active="/datenschutz"
    >
      <P>
        Diese Erklärung richtet sich nach dem revidierten Schweizer Datenschutzgesetz, das
        seit dem 1. September 2023 gilt. Sie nennt die Punkte, über die wir informieren
        müssen: wer verantwortlich ist, wozu wir Daten bearbeiten, wer sie erhält und wohin
        sie gehen.
        <Ref>Art. 19 DSG</Ref> Soweit Personen aus dem EU-Raum betroffen sind, gelten
        zusätzlich die Regeln der DSGVO.
      </P>

      <H2>1. Verantwortliche Stelle</H2>
      <P>
        <strong className="font-semibold text-white">
          <Fill value={LEGAL.betreiberin} />
        </strong>
        , <Fill value={LEGAL.strasse} />, <Fill value={LEGAL.plzOrt} />, {LEGAL.land}
        <br />
        E-Mail: <Fill value={LEGAL.email} />
      </P>
      <P>
        Eine Datenschutzberaterin oder einen Datenschutzberater haben wir nicht bestellt;
        das ist für ein Unternehmen dieser Grösse nicht vorgeschrieben. Anliegen zum
        Datenschutz gehen an die obige Adresse.
      </P>

      <H2>2. Welche Daten wir bearbeiten</H2>

      <H3>Konto und Firmenprofil</H3>
      <UL>
        <LI>E-Mail-Adresse, Name und Passwort-Merkmale für die Anmeldung</LI>
        <LI>
          Firmenname, UID, Rolle (Bauunternehmen oder Baustoffwerk), Adresse, Ort, Kanton,
          Telefon, Website, Logo, Kurzbeschreibung
        </LI>
        <LI>Bei Baustoffwerken zusätzlich Sortiment, Liefergebiete, Lieferradius, Kapazität</LI>
      </UL>

      <H3>Nutzung der Plattform</H3>
      <UL>
        <LI>Verbindungen zu anderen Firmen, gesendete und erhaltene Anfragen</LI>
        <LI>Nachrichten im Chat samt Zeitpunkt und Lesevermerk</LI>
        <LI>Gemeldeter Materialbedarf, Bündel-Teilnahmen, Gebote, Zuschläge</LI>
        <LI>Beiträge im Feed, hochgeladene Bilder, Projekte und Baustellen</LI>
        <LI>Eigene Materialien und deren Zuordnung zum gemeinsamen Katalog</LI>
      </UL>

      <H3>Technische Daten</H3>
      <P>
        Beim Aufruf der Seite fallen beim Hosting-Dienst die üblichen Server-Angaben an:
        IP-Adresse, Zeitpunkt, aufgerufene Adresse, Browser-Kennung. Wir werten diese Daten
        nicht personenbezogen aus.
      </P>

      <H3>Was wir nicht tun</H3>
      <UL>
        <LI>
          <strong className="font-semibold text-white">Kein Standort-Zugriff.</strong> Die
          Karte fragt den Browser nie nach deinem Aufenthaltsort. Der Punkt auf der Karte
          entsteht ausschliesslich aus der Firmenadresse, die du selbst einträgst.
        </LI>
        <LI>
          <strong className="font-semibold text-white">Keine Werbe- oder Analyse-Dienste.</strong>{" "}
          Es sind keine Zählpixel, keine Werbenetzwerke und keine Besucher-Auswertung
          eingebunden.
        </LI>
        <LI>
          <strong className="font-semibold text-white">Kein Verkauf von Daten.</strong> Wir
          geben Daten nicht zu Werbezwecken weiter.
        </LI>
      </UL>

      <H3>Cookies</H3>
      <P>
        Wir setzen nur Cookies, die den Betrieb möglich machen: die Anmeldung hält deine
        Sitzung offen, und in der Vorstart-Phase merkt sich ein Cookie die Freischaltung.
        Cookies zur Beobachtung des Verhaltens setzen wir keine.
      </P>

      <H2>3. Wozu wir die Daten bearbeiten</H2>
      <UL>
        <LI>Um das Konto zu führen und die Plattform bereitzustellen</LI>
        <LI>
          Um Firmen zusammenzubringen: Vorschläge, Verbindungen, Nachrichten, Bündel und
          Angebote
        </LI>
        <LI>Um Standorte auf der Karte zu zeigen — nur bei ausdrücklicher Zustimmung</LI>
        <LI>Um Missbrauch zu erkennen und die Plattform sicher zu betreiben</LI>
        <LI>Um gesetzliche Pflichten zu erfüllen, etwa in der Buchhaltung</LI>
      </UL>
      <P>
        Grundlage ist der Vertrag über die Nutzung der Plattform sowie unser berechtigtes
        Interesse an einem sicheren, funktionierenden Betrieb. Wo wir nach einer Zustimmung
        fragen — beim Eintrag auf der Karte —, kannst du sie jederzeit zurückziehen.
      </P>

      <H2>4. Wer die Daten sieht</H2>

      <H3>Andere Firmen auf der Plattform</H3>
      <UL>
        <LI>
          <strong className="font-semibold text-white">Für alle angemeldeten Firmen sichtbar:</strong>{" "}
          Firmenname, UID, Rolle, Ort und Kanton, Logo, Beschreibung, Sortiment und
          Liefergebiete, Beiträge im Feed.
        </LI>
        <LI>
          <strong className="font-semibold text-white">Nur für bestätigte Verbindungen:</strong>{" "}
          E-Mail, Telefon, Adresse und Website. Diese Einschränkung ist in der Datenbank
          verankert, nicht bloss in der Anzeige.
        </LI>
        <LI>
          <strong className="font-semibold text-white">Nur mit Zustimmung:</strong> der Standort
          auf der Karte. Ohne Zustimmung sind gar keine Koordinaten gespeichert.
        </LI>
        <LI>
          <strong className="font-semibold text-white">Nur die Beteiligten:</strong> Nachrichten,
          Direktanfragen und Angebote. Gebote in einem Bündel bleiben bis zum Zuschlag
          verdeckt.
        </LI>
      </UL>

      <H3>Dienstleister</H3>
      <P>
        Wir setzen Auftragsbearbeiter ein, die Daten ausschliesslich für uns und nach
        unseren Weisungen bearbeiten:
      </P>
      <UL>
        <LI>
          <strong className="font-semibold text-white">Clerk</strong> (USA) — Anmeldung und
          Sitzungsverwaltung.
        </LI>
        <LI>
          <strong className="font-semibold text-white">Supabase</strong> — Datenbank, Speicher
          für hochgeladene Bilder und Echtzeit-Zustellung der Nachrichten. Serverstandort:{" "}
          <Fill value={LEGAL.datenbankRegion} />.
        </LI>
        <LI>
          <strong className="font-semibold text-white">Vercel</strong> (USA) — Betrieb und
          Auslieferung der Seite.
        </LI>
      </UL>

      <H3>Aufrufe an Dritte beim Betrieb</H3>
      <UL>
        <LI>
          <strong className="font-semibold text-white">swisstopo</strong>{" "}
          (Bundesamt für Landestopografie, Schweiz) — schaltest du den Karteneintrag ein
          oder änderst du die Adresse, senden wir die eingetragene{" "}
          <em>Firmenadresse</em> einmalig an die amtliche Adresssuche, um die Koordinaten
          zu erhalten. Es geht keine Nutzerkennung mit.
        </LI>
        <LI>
          <strong className="font-semibold text-white">OpenStreetMap</strong> — das
          Kartenbild wird von deren Servern geladen. Dabei erfährt OpenStreetMap deine
          IP-Adresse. Das lässt sich beim Anzeigen einer Karte technisch nicht vermeiden;
          betroffen ist nur, wer die Kartenseite öffnet.
        </LI>
      </UL>
      <P>
        Die Schrift der Seite wird mit ausgeliefert und nicht von einem fremden Server
        nachgeladen — beim blossen Aufruf der übrigen Seiten fliesst also nichts an Dritte
        ab.
      </P>

      <H2>5. Bekanntgabe ins Ausland</H2>
      <P>
        Clerk und Vercel haben ihren Sitz in den USA. Der Bundesrat hat die USA am
        15. September 2024 in die Liste der Staaten mit angemessenem Datenschutz
        aufgenommen — allerdings nur für Unternehmen, die nach dem Swiss-U.S. Data Privacy
        Framework zertifiziert sind.
        <Ref>Art. 16 DSG, Anhang 1 DSV</Ref> Wo diese Zertifizierung nicht greift, stützen
        wir die Übermittlung auf Standardvertragsklauseln.
      </P>
      <P>
        Der Serverstandort der Datenbank ist oben genannt. Liegt er in der EU, erfolgt die
        Bekanntgabe in einen Staat mit anerkanntem Schutzniveau.
      </P>

      <H2>6. Wie lange wir Daten aufbewahren</H2>
      <UL>
        <LI>Konto- und Profildaten: solange das Konto besteht</LI>
        <LI>
          Nachrichten, Anfragen, Gebote und Zuschläge: solange sie für die Abwicklung und
          den Nachweis eines Geschäfts nötig sind
        </LI>
        <LI>
          Unterlagen mit Buchhaltungsbezug: zehn Jahre, wie es das Obligationenrecht
          verlangt <Ref>Art. 958f OR</Ref>
        </LI>
        <LI>
          Standortkoordinaten: nur solange die Zustimmung für die Karte besteht — beim
          Zurückziehen werden sie gelöscht
        </LI>
      </UL>
      <P>
        Danach löschen oder anonymisieren wir die Daten. Was andere Firmen zulässig
        erhalten haben — etwa eine Nachricht in ihrem Postfach — können wir bei ihnen nicht
        mehr entfernen.
      </P>

      <H2>7. Deine Rechte</H2>
      <UL>
        <LI>Auskunft darüber, welche Daten wir über dich bearbeiten <Ref>Art. 25 DSG</Ref></LI>
        <LI>Berichtigung unrichtiger Daten <Ref>Art. 32 DSG</Ref></LI>
        <LI>Löschung, soweit keine Aufbewahrungspflicht entgegensteht</LI>
        <LI>Herausgabe oder Übertragung deiner Daten in einem gängigen Format <Ref>Art. 28 DSG</Ref></LI>
        <LI>Widerspruch gegen eine Bearbeitung und Rückzug einer erteilten Zustimmung</LI>
      </UL>
      <P>
        Ein grosser Teil davon geht sofort und ohne Anfrage: Firmendaten, Adresse und
        Kontakt änderst du selbst unter „Profil bearbeiten", den Karteneintrag schaltest du
        auf der Karte ein und aus. Für alles Weitere genügt eine E-Mail an{" "}
        <Fill value={LEGAL.email} />.
      </P>
      <P>
        Wer sich beschweren möchte, kann sich an den Eidgenössischen Datenschutz- und
        Öffentlichkeitsbeauftragten (EDÖB) in Bern wenden.
      </P>

      <H2>8. Sicherheit</H2>
      <P>
        Die Verbindung ist durchgehend verschlüsselt. In der Datenbank entscheidet für jede
        Zeile eine Regel, wer sie lesen darf; Kontaktdaten und interne Kennungen sind über
        die allgemeine Freigabe gar nicht erst erreichbar. Hochgeladene Bilder landen im
        Ordner der eigenen Firma, und niemand darf in einen fremden schreiben. Eine
        absolute Sicherheit gibt es im Internet dennoch nicht.
      </P>

      <H2>9. Änderungen</H2>
      <P>
        Wir passen diese Erklärung an, wenn sich die Plattform oder die Rechtslage ändert.
        Massgebend ist die hier veröffentlichte Fassung mit dem oben genannten Stand.
      </P>
    </LegalPage>
  );
}

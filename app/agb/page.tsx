import LegalPage, { H2, H3, P, UL, LI, Fill, Ref } from "@/components/legal/LegalPage";
import { LEGAL } from "@/data/legal";

export const metadata = {
  title: "AGB · Obtanet",
  description: "Allgemeine Geschäftsbedingungen für die Nutzung der Plattform Obtanet.",
};

export default function AgbPage() {
  return (
    <LegalPage
      title="Allgemeine Geschäftsbedingungen"
      lead="Die Regeln für die Nutzung von Obtanet — zwischen Firmen, nicht mit Konsumenten."
      active="/agb"
    >
      <H2>1. Wer diese Bedingungen bindet</H2>
      <P>
        Diese Bedingungen gelten zwischen{" "}
        <strong className="font-semibold text-slate-900">
          <Fill value={LEGAL.betreiberin} />
        </strong>{" "}
        („Obtanet") und jeder Firma, die ein Konto auf der Plattform eröffnet („Nutzerin").
      </P>
      <P>
        Obtanet richtet sich ausschliesslich an Unternehmen: an Bauunternehmen, die Material
        beschaffen, und an Baustoffwerke und Lieferanten, die Material anbieten. Ein Konto
        setzt eine im Schweizer Handelsregister eingetragene Firma mit UID voraus. Für
        Konsumentinnen und Konsumenten ist die Plattform nicht bestimmt; die
        Schutzbestimmungen des Konsumentenrechts finden auf dieses Verhältnis keine
        Anwendung. <Ref>vgl. Art. 8 UWG, der nur Konsumentenverträge erfasst</Ref>
      </P>
      <P>
        Mit der Eröffnung eines Kontos erklärt die Nutzerin, diese Bedingungen gelesen zu
        haben und anzunehmen. Eigene Einkaufs- oder Verkaufsbedingungen der Nutzerin gelten
        für das Verhältnis zu Obtanet nicht, auch wenn Obtanet ihnen nicht ausdrücklich
        widerspricht.
      </P>

      <H2>2. Was Obtanet ist — und was nicht</H2>
      <P>
        Obtanet ist eine Vermittlungs- und Netzwerkplattform. Sie führt Bedarf und Angebot
        zusammen, bündelt gleichartigen Bedarf mehrerer Firmen und stellt die Werkzeuge für
        Anfrage, Angebot und Verhandlung bereit.
      </P>
      <P>
        <strong className="font-semibold text-slate-900">
          Obtanet wird nicht Partei der Liefergeschäfte.
        </strong>{" "}
        Kauf- und Werkverträge über Material kommen ausschliesslich zwischen der
        beschaffenden Firma und dem liefernden Werk zustande. Obtanet schuldet weder
        Lieferung noch Qualität, Menge, Termin oder Zahlung und tritt weder als
        Verkäuferin noch als Bürgin auf. Mängelrügen, Verzug und Gewährleistung richten
        sich allein nach dem Vertrag zwischen den beiden Parteien.
      </P>
      <P>
        Obtanet prüft Firmenangaben nicht auf Richtigkeit. Ein Verifizierungsvermerk
        bedeutet nur, dass wir die Eintragung im Handelsregister nachvollzogen haben — er
        ist keine Aussage über Bonität, Leistungsfähigkeit oder Zuverlässigkeit.
      </P>

      <H2>3. Konto</H2>
      <UL>
        <LI>
          Die Angaben im Firmenprofil müssen wahr und aktuell sein. Wer sie ändert, hält
          sie über „Profil bearbeiten" nach.
        </LI>
        <LI>
          Das Konto ist an die Firma gebunden. Zugangsdaten dürfen nicht an Dritte
          weitergegeben werden; Handlungen über das Konto muss sich die Nutzerin
          zurechnen lassen.
        </LI>
        <LI>
          Ein Konto für eine Firma, für die keine Vertretungsbefugnis besteht, ist
          unzulässig.
        </LI>
      </UL>

      <H2>4. Bündel und verdeckte Angebote</H2>

      <H3>4.1 Ablauf</H3>
      <UL>
        <LI>
          <strong className="font-semibold text-slate-900">Bedarf melden.</strong> Eine
          beschaffende Firma meldet Material, Menge, Region und Zeitraum. Gleichartiger
          Bedarf mehrerer Firmen wird zu einem Bündel zusammengefasst.
        </LI>
        <LI>
          <strong className="font-semibold text-slate-900">Sammelphase.</strong> Das Bündel
          wächst, bis die Frist abläuft. Je grösser das Volumen, desto höher der
          ausgewiesene Mindestvorteil.
        </LI>
        <LI>
          <strong className="font-semibold text-slate-900">Verdeckte Gebote.</strong> Werke
          geben Angebote ab, ohne die Gebote der übrigen zu sehen. Bis zum Zuschlag bleiben
          sie verdeckt.
        </LI>
        <LI>
          <strong className="font-semibold text-slate-900">Zuschlag.</strong> Nach Fristablauf
          erhält das beste Angebot den Zuschlag. Danach schliessen die Beteiligten ihren
          Vertrag — Grundlage ist in der Regel die SIA-Norm 118.
        </LI>
      </UL>

      <H3>4.2 Was wann verbindlich ist</H3>
      <UL>
        <LI>
          Die Meldung eines Bedarfs ist eine Absichtserklärung zur Teilnahme am Bündel und
          noch kein Kaufvertrag.
        </LI>
        <LI>
          Ein abgegebenes Gebot eines Werks ist ein verbindliches Angebot im Sinne des
          Obligationenrechts und bleibt bis zum Ablauf der genannten Frist bindend.
          <Ref>Art. 3 ff. OR</Ref>
        </LI>
        <LI>
          Mit dem Zuschlag kommt zwischen den Teilnehmenden und dem Werk ein Vertrag zu den
          ausgeschriebenen Bedingungen zustande. Wer bis dahin seinen Bedarf zurückzieht,
          ist nicht gebunden.
        </LI>
        <LI>
          Wird das Zielvolumen bis zur Frist nicht erreicht, wird das Bündel aufgelöst. Es
          entsteht keine Verpflichtung und kein Anspruch auf einen Vorteil.
        </LI>
      </UL>

      <H3>4.3 Vertraulichkeit der Gebote</H3>
      <P>
        Angaben aus dem Bündel — insbesondere Gebote, Preise und die Zusammensetzung der
        Teilnehmenden — sind vertraulich und dürfen nicht an Dritte oder an Mitbewerber
        weitergegeben werden. Absprachen zwischen Anbietern über Preise, Mengen oder die
        Aufteilung von Bündeln sind untersagt und können nach dem Kartellgesetz verfolgt
        werden.
      </P>

      <H3>4.4 Preisvorteil gegenüber der Referenz</H3>
      <P>
        Wo Obtanet einen Mindestvorteil gegenüber einem Referenzpreis ausweist, gilt dieser
        für das jeweilige Bündel in der zum Zeitpunkt des Zuschlags auf der Plattform
        ausgewiesenen Höhe. Der Referenzpreis ist ein Vergleichswert, kein Marktpreis und
        keine Zusicherung eines bestimmten Marktniveaus. Massgebend für die Abrechnung ist
        allein der Preis aus dem Vertrag zwischen Nutzerin und Werk.
      </P>

      <H2>5. Direktanfragen und Nachrichten</H2>
      <P>
        Unabhängig von Bündeln kann eine Firma ein Werk direkt anfragen. Auch hier ist
        Obtanet nur Übermittlerin. Nachrichten dürfen nicht für Werbung an Empfänger genutzt
        werden, die damit nicht rechnen müssen. <Ref>Art. 3 Abs. 1 lit. o UWG</Ref>
      </P>

      <H2>6. Inhalte der Nutzerinnen</H2>
      <UL>
        <LI>
          Für eingestellte Beiträge, Bilder, Firmenangaben und Nachrichten ist allein die
          einstellende Firma verantwortlich. Sie sichert zu, über die nötigen Rechte zu
          verfügen.
        </LI>
        <LI>
          Obtanet erhält das nicht ausschliessliche Recht, diese Inhalte im Rahmen des
          Betriebs der Plattform zu speichern und den dafür vorgesehenen Empfängern
          anzuzeigen. Weitergehende Rechte erhalten wir nicht.
        </LI>
        <LI>
          Rechtswidrige, irreführende oder beleidigende Inhalte dürfen nicht eingestellt
          werden. Obtanet darf solche Inhalte entfernen und das betroffene Konto sperren.
        </LI>
      </UL>

      <H2>7. Entgelt</H2>
      <P>
        Die Nutzung der Plattform ist für beschaffende Firmen kostenlos. Kommt über ein
        Bündel oder eine Direktanfrage ein Geschäft zustande, schuldet das liefernde Werk
        Obtanet ein Vermittlungsentgelt von <Fill value={LEGAL.kommission} /> Prozent des
        Auftragswerts, zuzüglich Mehrwertsteuer. Das Entgelt wird nach Abschluss in
        Rechnung gestellt und ist innert 30 Tagen zahlbar.
      </P>
      <P>
        Ein Umgehen der Plattform, um das Entgelt zu vermeiden — insbesondere der Abschluss
        eines über Obtanet angebahnten Geschäfts ausserhalb der Plattform —, verpflichtet
        das Werk gleichwohl zur Zahlung.
      </P>

      <H2>8. Verfügbarkeit</H2>
      <P>
        Wir bemühen uns um einen zuverlässigen Betrieb, schulden aber keine bestimmte
        Verfügbarkeit. Wartung, Störungen bei Dienstleistern und höhere Gewalt können zu
        Unterbrüchen führen. Fristen in laufenden Bündeln verlängern wir, wenn ein Unterbruch
        die Teilnahme verhindert hat.
      </P>

      <H2>9. Haftung</H2>
      <P>
        Obtanet haftet für Schäden aus Absicht und grober Fahrlässigkeit. Für leichte
        Fahrlässigkeit ist die Haftung ausgeschlossen, soweit das Gesetz das zulässt.
        <Ref>Art. 100 f. OR</Ref>
      </P>
      <P>
        Nicht ersetzt werden insbesondere entgangener Gewinn, mittelbare Schäden und
        Schäden aus dem Verhalten anderer Nutzerinnen — namentlich aus Nichtlieferung,
        Mängeln, Verzug oder Zahlungsausfall im Verhältnis zwischen beschaffender Firma und
        Werk. Ansprüche daraus sind gegenüber der jeweiligen Vertragspartei geltend zu
        machen.
      </P>

      <H2>10. Datenschutz</H2>
      <P>
        Welche Daten wir bearbeiten, wer sie erhält und welche Rechte bestehen, steht in der{" "}
        <a href="/datenschutz" className="font-medium text-brand hover:underline">
          Datenschutzerklärung
        </a>
        . Sie ist Bestandteil dieser Bedingungen.
      </P>

      <H2>11. Dauer und Beendigung</H2>
      <UL>
        <LI>
          Das Konto läuft unbefristet. Beide Seiten können es jederzeit ohne Angabe von
          Gründen beenden.
        </LI>
        <LI>
          Bei schwerem Verstoss — falsche Firmenangaben, Preisabsprachen, Missbrauch der
          Nachrichten — dürfen wir das Konto fristlos sperren.
        </LI>
        <LI>
          Laufende Bündel und bereits erteilte Zuschläge bleiben von einer Beendigung
          unberührt.
        </LI>
      </UL>

      <H2>12. Änderungen dieser Bedingungen</H2>
      <P>
        Wir dürfen diese Bedingungen anpassen. Änderungen kündigen wir mindestens 30 Tage
        vorher in der Anwendung an. Wer der neuen Fassung nicht zustimmt, kann das Konto bis
        zum Inkrafttreten beenden; die weitere Nutzung danach gilt als Zustimmung.
      </P>

      <H2>13. Anwendbares Recht und Gerichtsstand</H2>
      <P>
        Es gilt Schweizer Recht unter Ausschluss des Übereinkommens der Vereinten Nationen
        über Verträge über den internationalen Warenkauf (CISG). Ausschliesslicher
        Gerichtsstand ist <Fill value={LEGAL.gerichtsstand} />. Diese Abrede ist zulässig,
        weil beide Seiten Unternehmen sind. <Ref>Art. 17 ZPO</Ref>
      </P>
      <P>
        Sollte eine Bestimmung unwirksam sein, bleiben die übrigen gültig; an ihre Stelle
        tritt, was dem Gewollten wirtschaftlich am nächsten kommt.
      </P>
    </LegalPage>
  );
}

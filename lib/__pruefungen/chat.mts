import assert from 'node:assert/strict';
import { ausThreadZeilen, fensterEinfuegen, sichtbareGespraeche } from '../chat.ts';
import type { ChatNachricht, ThreadZeile } from '../chat.ts';

let n = 0;
const test = (name: string, f: () => void) => { f(); n++; console.log('  ok  ' + name); };

const z = (o: Partial<ThreadZeile>): ThreadZeile => ({
  other_company_id: 'x', last_message_at: null, last_content: null, last_is_offer: false,
  last_from_me: false, unread_count: 0, last_offer_content: null, archived: false, ...o });

const m = (id: string, at: string, extra: Partial<ChatNachricht> = {}): ChatNachricht => ({
  id, sender_company_id: 'a', receiver_company_id: 'b', content: id,
  is_negotiation_offer: false, offer_amount: null, created_at: at, ...extra });

console.log('ausThreadZeilen');
test('Vorschau, Zähler und Archiv landen je Gegenüber richtig', () => {
  const r = ausThreadZeilen([
    z({ other_company_id: 'b', last_message_at: '2026-01-02', last_content: 'hallo', unread_count: 3 }),
    z({ other_company_id: 'c', last_message_at: '2026-01-05', archived: true }),
  ]);
  assert.deepEqual(r.ids, ['b', 'c']);
  assert.equal(r.zuletzt.b.text, 'hallo');
  assert.equal(r.ungelesen.b, 3);
  assert.equal(r.archiviert.c, true);
});
test('jüngstes Gespräch überspringt weggelegte', () => {
  const r = ausThreadZeilen([
    z({ other_company_id: 'b', last_message_at: '2026-01-02' }),
    z({ other_company_id: 'c', last_message_at: '2026-01-09', archived: true }),
  ]);
  assert.equal(r.jungstes, 'b');
});
test('alles weggelegt: es öffnet sich keines', () => {
  assert.equal(ausThreadZeilen([z({ other_company_id: 'b', archived: true })]).jungstes, null);
});
test('Gespräch ohne Nachrichten kippt die Sortierung nicht', () => {
  const r = ausThreadZeilen([
    z({ other_company_id: 'leer', last_message_at: null }),
    z({ other_company_id: 'voll', last_message_at: '2026-01-01' }),
  ]);
  assert.equal(r.jungstes, 'voll');
  assert.equal(r.zuletzt.leer.at, null);
});
test('letztes Angebot wird als Kontext übernommen', () => {
  const r = ausThreadZeilen([z({ other_company_id: 'b', last_offer_content: 'Beton C25/30 · 133.60' })]);
  assert.equal(r.angebote.b, 'Beton C25/30 · 133.60');
});

console.log('fensterEinfuegen');
test('erstes Fenster wird gedreht: älteste zuerst', () => {
  const r = fensterEinfuegen([], [m('3', '2026-01-03'), m('2', '2026-01-02'), m('1', '2026-01-01')]);
  assert.deepEqual(r.map((x) => x.id), ['1', '2', '3']);
});
test('eigene unbestätigte Nachricht überlebt das erste Fenster', () => {
  const r = fensterEinfuegen([m('tmp-9', '2026-01-04')], [m('2', '2026-01-02'), m('1', '2026-01-01')]);
  assert.deepEqual(r.map((x) => x.id), ['1', '2', 'tmp-9']);
});
test('älteres Fenster kommt davor', () => {
  const alt = fensterEinfuegen([], [m('3', '2026-01-03'), m('2', '2026-01-02')]);
  const r = fensterEinfuegen(alt, [m('1', '2026-01-01'), m('0', '2026-01-00')], '2026-01-02');
  assert.deepEqual(r.map((x) => x.id), ['0', '1', '2', '3']);
});
test('doppelt geholtes kommt nicht doppelt an', () => {
  const alt = fensterEinfuegen([], [m('2', '2026-01-02'), m('1', '2026-01-01')]);
  const r = fensterEinfuegen(alt, [m('1', '2026-01-01')], '2026-01-02');
  assert.deepEqual(r.map((x) => x.id), ['1', '2']);
});

console.log('sichtbareGespraeche');
const f = [{ id: 'b', company_name: 'Beispiel Baustoff AG' }, { id: 'c', company_name: 'Demo Tiefbau AG' }, { id: 'd', company_name: 'Muster Kies AG' }];
const zeit = (id: string) => ({ b: '2026-01-05', c: '2026-01-09', d: '' }[id] ?? '');
test('aktive Ansicht zeigt nur nicht weggelegte, neueste oben', () => {
  const r = sichtbareGespraeche(f, { archiviert: { d: true }, zeigeArchiv: false, suche: '', zeitpunkt: zeit });
  assert.deepEqual(r.map((x) => x.id), ['c', 'b']);
});
test('Archivansicht zeigt genau die weggelegten', () => {
  const r = sichtbareGespraeche(f, { archiviert: { d: true }, zeigeArchiv: true, suche: '', zeitpunkt: zeit });
  assert.deepEqual(r.map((x) => x.id), ['d']);
});
test('Suche greift innerhalb der Ansicht', () => {
  const r = sichtbareGespraeche(f, { archiviert: {}, zeigeArchiv: false, suche: 'tief', zeitpunkt: zeit });
  assert.deepEqual(r.map((x) => x.id), ['c']);
});
test('Suche in Grossbuchstaben findet dasselbe', () => {
  const r = sichtbareGespraeche(f, { archiviert: {}, zeigeArchiv: false, suche: '  KIES ', zeitpunkt: zeit });
  assert.deepEqual(r.map((x) => x.id), ['d']);
});
test('die Eingabeliste wird nicht verändert', () => {
  const kopie = [...f];
  sichtbareGespraeche(f, { archiviert: {}, zeigeArchiv: false, suche: '', zeitpunkt: zeit });
  assert.deepEqual(f, kopie);
});
console.log('\n' + n + ' Prüfungen, alle bestanden.');

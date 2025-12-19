Phase 0 – Bestandsaufnahme & Aufräumen (UI/Seiten)

 Analyse aller bestehenden Seiten und Komponenten (Mapping erstellen: Datei → Zweck → bleibt/raus/umbauen).

 Statistiken-Seite entschlacken (nur modulbezogene KPIs später nutzen; Charts-Museum entfernen). Quelle aktuell: statistiken.html.

 Termine & Anfragen: Kalender-Connect (Google/Outlook) entfernen; Seite aus Kundensicht deaktivieren (später eigenständiges Modul, wenn nötig). Quelle: termine.html.

 Workflow-Monitor als Admin-intern markieren oder deaktivieren (nicht kundenseitig anzeigen). Quelle: workflows.html.

 Support & Tickets behalten; später Admin-Queue einführen. Quelle: support.html.

 Benutzerverwaltung auf 1 Login pro Kunde vereinfachen (Mehrnutzer-UI entfernen/verstecken).

 Sicherheit & Logs/Dokumentation im MVP ausblenden (nur Passwort ändern bleibt).

Abnahme: „Customer“-Rolle sieht nur Dashboard, (später) Telefon/WhatsApp, Kosten, Rechnungen, Support, Einstellungen. Keine Kalender-/Workflow-Seiten mehr.

Phase 1 – Datenmodell & Migration

 Tabelle customers prüfen/ergänzen: id, name, email, timezone, branding_json (Logo/Farbe optional).

 Neue Tabelle customer_modules: id, customer_id, module_key (z. B. voice, whatsapp, costs, invoices, support), enabled (bool), settings_json.

 Rollen vereinfachen: users(role: 'admin'|'customer'), customer_id (bei Kunden).

 Events & KPIs (vorbereiten):

events_raw (provider, payload_json, occurred_at, customer_id, module_key)

metrics_daily (customer_id, module_key, date, kpis_json)

 Indizes: (customer_id, module_key, date).

Abnahme: Migrationen vorhanden; Relationen sauber; Admin kann Module pro Kunde speichern.

Phase 2 – Admin: Kundenanlage mit Modulauswahl

 Kunden-Wizard erweitern: Stammdaten + Modul-Toggles (Voice, WhatsApp, Costs, Invoices, Support).

 Kunden-Detailseite: Module nachträglich ein/aus schaltbar (persistiert in customer_modules).

 Default-Limits/Settings je Modul in settings_json (z. B. Voice: Öffnungszeiten/Weiterleitung später).

Abnahme: Neuer Kunde → Module gewählt → gespeichert → UI/Navi reagiert darauf.

Phase 3 – Navigation & Sichtbarkeit

 Dynamische Sidebar: Einträge nur rendern, wenn Modul aktiv.

voice → „Gespräche“

whatsapp → „WhatsApp“

costs → „Kosten“

invoices → „Rechnungen“

immer: „Dashboard“, „Support“, „Einstellungen“

 Route-Guards (Backend & Frontend) gemäß customer_modules.

Abnahme: Kunden mit nur voice+invoices sehen exakt: Dashboard, Gespräche, Rechnungen, Support, Einstellungen.

Phase 4 – Dashboard (MVP)

Nur 5 Widgets, modulbasiert (laden nur, wenn Modul aktiv):

 Voice-Widget: Today/Monat → Anrufe gesamt, % automatisiert, verpasst, Minuten (Quelle: metrics_daily.voice).

 WhatsApp-Widget: Today/Monat → eingehend, automatisch beantwortet, Fehlversuche.

 Kosten-Widget: Monat → Twilio €, OpenAI €, ElevenLabs € (Summe + Trend).

 Letzte Ereignisse (vereinheitlicht aus events_raw): z. B. „Anruf gelöst“, „WA-Antwort gesendet“, „Ticket erstellt“.

 Alerts: z. B. Fehlerrate ↑, Limit nahe.

Abnahme: Leeres Dashboard ohne aktive Module zeigt nur Begrüßung + Hinweis „keine Module aktiv“.

Phase 5 – Modul „Gespräche“ (Voice/Twilio)

 Liste: Anrufe (Zeit, Nummer, Status, Dauer, Ergebnis „gelöst/weitergeleitet/verpasst“).

 Filter: Zeitraum, Status, Ergebnis.

 KPI-Leiste (oben): Monat → gesamt, angenommen, verpasst, % automatisiert, Minuten, Ø Dauer.

 (Optional/konfig): Transkript-Spalte, wenn vorhanden/erlaubt.

 Datenquellen: Twilio Call Logs → events_raw → nächtliche Aggregation nach metrics_daily.voice.

Abnahme: Zahlen im Modul = Zahlen im Dashboard (gleiches Zeitfenster).

Phase 6 – Modul „WhatsApp“ (Messaging)

 Liste: eingehend/ausgehend, Status (delivered/failed), Regel „auto“ ja/nein.

 KPI-Leiste: Monat → eingehend, auto beantwortet, Zustellrate, Fehlversuche, Ø Antwortzeit (wenn messbar).

 Datenquellen: Messaging/Conversations Logs → events_raw → Aggregation metrics_daily.whatsapp.

Abnahme: Filterbar, KPIs plausibel, nur sichtbar wenn Modul aktiv.

Phase 7 – Modul „Kosten“

 Monatswerte: Twilio €, OpenAI €, ElevenLabs €, Summe.

 Zeitraumwechsel (aktueller/letzter Monat).

 API-Abrufe in Worker, tägliche Summen in metrics_daily.costs.

Abnahme: Summe = Einzelwerte; Fehlertoleranz (Fallback bei API-Ausfällen).

Phase 8 – Modul „Rechnungen“

 Tabelle: Nummer, Datum, Betrag, Status (offen/bezahlt), Download (PDF).

 Admin-Upload (Zuweisung zu customer_id).

 Optional: Notizfeld/Referenz.

Abnahme: Kunde sieht nur eigene Rechnungen; Download funktioniert.

Phase 9 – „Support“

 Kundenseite: Ticket anlegen, Liste mit Status (offen/pendend/geschlossen).

 Admin-Queue: alle Tickets mit Filter (Kunde, Status, Datum).

 Auto-Event in events_raw („ticket_created“), damit im Dashboard „Letzte Ereignisse“ auftaucht.

Abnahme: Neues Ticket vom Kunden erscheint in Admin-Queue; Statuswechsel synchron.

Phase 10 – „Einstellungen“ (MVP)

 Firmenprofil: Name, E-Mail, Logo (optional).

 Passwort ändern.

 (Später:) Modul-spezifische Settings (z. B. Voice-Weiterleitung, Öffnungszeiten).

Abnahme: Änderungen werden gespeichert; kein Zugriff auf andere Kunden.

Phase 11 – Datenpipelines (Worker/Cron)

 Twilio Calls → events_raw (inkrementell, seit letztem Timestamp).

 WhatsApp Logs → events_raw.

 Usage (Twilio/OpenAI/EL) → metrics_daily.costs.

 Nightly Aggregation: events_raw → metrics_daily (voice, whatsapp).

 Retention (MVP): keine Löschung; nur technische Grenzen (später DSGVO/TTL).

Abnahme: Reproduzierbare KPIs für „aktueller Monat“ + „letzte 30 Tage“.

Phase 12 – Rechte & Guards

 role=customer: Zugriff nur auf eigene Daten/Module.

 role=admin: Admin-Bereiche + Modul-Toggles.

 Serverseitige Prüfungen für jede Route/API (kein reines Frontend-Hiding).

Abnahme: Versuchte Zugriffe auf inaktive Module liefern 403.

Phase 13 – QA & Monitoring

 Testfälle pro Modul (Anzeige/Navi/KPIs/Filter).

 Datenvergleich: Summe Dashboard ↔ Detailseite.

 Fehler-Logging (API-Fehler, Rate Limits).

 Performance: Dashboard-Antwort < 300 ms aus metrics_daily.

Phase 14 – Übergabe & Doku (leichtgewichtig)

 Kurze README: Module, Tabellen, APIs, Worker.

 Admin-Kurzanleitung: Kunde anlegen + Module togglen.

 Support-Prozess: Ticket-Lebenszyklus.

Hinweise zur Umsetzung am bestehenden Code

Statistiken/Charts nur behalten, wenn sie direkt modulare KPIs zeigen (sonst entfernen/ausblenden). Quelle: statistiken.html.

Termine/Reservierungen/Leads: Seite deaktivieren, Kalender-Buttons entfernen. Quelle: termine.html.

Workflow-Monitor: Kundensicht ausblenden, optional als Admin-Debug. Quelle: workflows.html.

Support beibehalten, später Admin-Queue ergänzen. Quelle: support.html.
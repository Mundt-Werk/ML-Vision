# 🔒 Firestore Security Rules - sales_leads Collection

**WICHTIG:** Diese Security Rules müssen in der Firebase Console eingetragen werden!

---

## 📍 Wo eintragen?

1. Gehe zu: https://console.firebase.google.com/
2. Wähle Projekt: **ml-vision-273ee**
3. Links im Menü: **Firestore Database**
4. Oben Tab: **Regeln**
5. Füge die unten stehenden Rules hinzu

---

## 📝 Security Rules Code

```javascript
claude

**Was bedeutet das?**
- `request.auth != null` - User muss angemeldet sein
- `get(...).data.role == 'admin'` - User muss Admin-Rolle haben
- Gilt für: **CREATE, READ, UPDATE, DELETE**

**Sicherheit:**
- ✅ Nur authentifizierte Admins können Leads sehen
- ✅ Nur authentifizierte Admins können Leads erstellen/bearbeiten/löschen
- ❌ Normale Kunden können KEINE Leads sehen
- ❌ Nicht-authentifizierte User haben KEINEN Zugriff

---

## ⚠️ WICHTIG: User-Rolle prüfen

Die Security Rule prüft, ob der User die Rolle **'admin'** hat.

**Dein Admin-User muss in der `users` Collection diese Struktur haben:**

```javascript
{
  uid: "your-admin-uid",
  email: "admin@ml-vision.de",
  role: "admin",  // ← WICHTIG!
  createdAt: "...",
  updatedAt: "..."
}
```

### Wo prüfen?

1. Firestore Database → Collection: `users`
2. Suche dein Admin-User Dokument
3. Prüfe: Feld `role` = `"admin"`
4. Falls nicht vorhanden: Manuell hinzufügen!

---

## 📊 Übersicht aller Collections

| Collection | Lesen | Schreiben | Bemerkung |
|------------|-------|-----------|-----------|
| `sales_leads` | Admin only | Admin only | Neue Collection |
| `customers` | Alle Auth Users | Alle Auth Users | Bestehend |
| `calls` | Alle Auth Users | Admin only | Bestehend |
| `tickets` | Alle Auth Users | Alle Auth Users | Bestehend |
| `invoices` | Alle Auth Users | Admin only | Bestehend |
| `users` | Nur eigenes Dokument | Admin only | Bestehend |

---

## 🚀 Deployment

**Nach dem Eintragen in der Firebase Console:**
1. Klicke auf **"Veröffentlichen"**
2. Warte auf Bestätigung
3. Rules sind sofort aktiv!

**Test:**
- Als Admin einloggen
- Admin-Bereich aufrufen: `/admin/pages/customers.html`
- Neuen Lead anlegen
- Sollte funktionieren ohne Fehler

---

## 🐛 Troubleshooting

### Fehler: "Missing or insufficient permissions"

**Ursache:** User ist kein Admin oder Rules sind falsch

**Lösung:**
1. Prüfe Firestore Rules in Console
2. Prüfe `users` Collection → Dein User → `role: "admin"`
3. Browser-Cache leeren & neu einloggen

### Fehler: "Document does not exist"

**Ursache:** User-Dokument in `users` Collection fehlt

**Lösung:**
1. Erstelle User-Dokument manuell in Firestore
2. Setze Felder: `uid`, `email`, `role: "admin"`

---

## 📞 Support

Bei Fragen zu Security Rules:
- Firebase Docs: https://firebase.google.com/docs/firestore/security/get-started
- Regel-Simulator in Firebase Console nutzen!

---

**Status:** ✅ Dokumentiert
**Letzte Aktualisierung:** 2026-01-07

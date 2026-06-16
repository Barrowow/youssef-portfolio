# Kontaktformular → n8n (lokal) → Gmail

Das Kontaktformular der Website schickt die Daten an einen **n8n-Webhook**.
n8n sendet daraus eine **E-Mail an jose.fathi@gmail.com** (über Gmail-SMTP).

```
Browser (Formular)  ──POST──►  n8n Webhook  ──►  Gmail senden  ──►  Antwort an Website
http://localhost:5173          http://localhost:5678/webhook/contact
```

---

## 1. n8n starten

n8n läuft bereits per `npx n8n` (Node ist installiert). Falls nicht, im Projektordner:

```bash
npx n8n
```

Dann im Browser öffnen: **http://localhost:5678**
Beim ersten Start legst du einen lokalen n8n-Account an (nur lokal, kostenlos).

---

## 2. Workflow importieren

1. In n8n oben rechts auf **⋯ → Import from File**
2. Datei wählen: `n8n/contact-workflow.json` (in diesem Projekt)
3. Der Workflow „Kontaktformular Website" mit 3 Knoten erscheint:
   **Webhook → Gmail senden → Antwort an Website**

---

## 3. Gmail-Zugang verbinden

1. Den Knoten **„Gmail senden"** öffnen
2. Bei **Credential to connect with** → **Create New Credential**
3. Variante A — **Gmail OAuth2** (empfohlen):
   - In der Google Cloud Console ein OAuth-Client-ID-Paar erstellen
     (Typ „Web application"), die von n8n angezeigte Redirect-URL eintragen.
   - Client-ID + Secret in n8n einfügen → **Sign in with Google**.
4. Variante B — schneller zum Testen — **SMTP statt Gmail-Node**:
   - Gmail-Knoten löschen, **„Send Email" (SMTP)** einfügen.
   - In deinem Google-Konto ein **App-Passwort** erstellen
     (Konto → Sicherheit → 2-Faktor → App-Passwörter).
   - SMTP-Host `smtp.gmail.com`, Port `465` (SSL), Benutzer = deine Gmail,
     Passwort = das App-Passwort.

> Empfänger ist im Workflow fest auf **jose.fathi@gmail.com** gesetzt
> (im Knoten „E-Mail senden" unter „To Email" änderbar).

---

## 4. Workflow aktivieren

Oben rechts den Schalter **Active** einschalten.
Damit ist die **Produktiv-URL** aktiv:

```
http://localhost:5678/webhook/contact
```

Diese URL steht bereits in `js/contact.js` (`N8N_WEBHOOK_URL`).

> **Test ohne Aktivieren:** Im Webhook-Knoten auf „Listen for test event"
> klicken — dann ist nur `…/webhook-test/contact` aktiv (einmalig).
> Für den Dauerbetrieb: Workflow **aktivieren** und `…/webhook/contact` nutzen.

---

## 5. Testen

1. Website öffnen (http://localhost:5173), auf **Contact** klicken.
2. Formular ausfüllen, **Nachricht senden**.
3. Erfolgsmeldung im Formular + E-Mail in ki@dba-gmbh.de.

### Fehlersuche
- **„Senden fehlgeschlagen"**: Läuft n8n? Ist der Workflow **aktiv**?
- **CORS-Fehler in der Konsole**: Der Webhook-Knoten hat `Allowed Origins = *`
  gesetzt (bereits im Import enthalten). Nach Änderungen Workflow neu aktivieren.
- **Keine Mail**: Gmail-Credential prüfen; im Workflow unter „Executions"
  die letzte Ausführung ansehen.

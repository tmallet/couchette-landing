# Couchette — Landing + waitlist

Companion **trains de nuit Europe** — landing marketing FR + capture waitlist.  
Not an OTA: discover · compare · prepare → deep-link opérateur.

**Live preview (jsDelivr):**  
https://cdn.jsdelivr.net/gh/tmallet/couchette-landing@main/index.html

**Proto CTA:**  
https://cdn.jsdelivr.net/gh/tmallet/couchette-proto@main/index.html

## Sections

1. Hero + CTA « Rejoindre la waitlist »
2. 3 bénéfices (carte multi-op · fiches cabines · alertes / Interrail-Eurail)
3. Lien « Voir le proto »
4. Formulaire : email · pays · intention
5. Confirmation après envoi

## Fichiers

```
index.html      Structure + copy FR
styles.css      Esthétique nuit (tokens proto)
config.js       Endpoint FormSubmit
app.js          Validation + POST + confirmation
waitlist-setup.md
README.md
```

## Waitlist (FormSubmit)

Submissions POST to FormSubmit (`config.js`). Fields: `email`, `country`, `intention`.

**One-time activation:** after the first submit, open the confirmation email sent to the FormSubmit inbox and click activate. Details: `waitlist-setup.md`.

Trigger activation manually:

```bash
curl -s -X POST https://formsubmit.co/ajax/thibaut3mallet@gmail.com \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"activation-test@example.com","country":"FR","intention":"explore","_subject":"Couchette waitlist activation","_captcha":"false"}'
```

## Local preview

```bash
cd couchette-landing
python3 -m http.server 8787
# → http://localhost:8787
```

(FormSubmit needs http(s), not `file://`.)

## Hors scope

Pas de booking in-app, pas de date de lancement, pas de feature dump.

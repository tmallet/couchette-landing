# Waitlist capture — setup

## Backend: FormSubmit.co

The landing posts three fields via AJAX:

| Field | Values |
|-------|--------|
| `email` | visitor email |
| `country` | `FR` · `BE` · `NL` · `LU` · `DE` · `UK` · `autre` |
| `intention` | `explore` · `destination` |

Endpoint (see `config.js`):

```
https://formsubmit.co/ajax/thibaut3mallet@gmail.com
```

### Activation (required once)

1. Open the live landing and submit the form once **or** run the curl in README.
2. Check **thibaut3mallet@gmail.com** for an email from FormSubmit.
3. Click the **activation / confirm** link.
4. Subsequent submissions arrive as emails with a table of the 3 fields.

### Export

- **Inbox**: each signup is an email → forward / label / filter.
- **CSV / Sheets**: FormSubmit dashboard (after login with that email) can list submissions; or auto-forward to a Google Form / Zapier / Make.
- **Local fallback**: `localStorage` key `couchette_waitlist` (browser-only, for smoke tests).

### Swap endpoint

Edit `config.js` → `FORM_ENDPOINT` (Formspree `https://formspree.io/f/xxxx`, Formspark `https://submit-form.com/xxxx`, etc.).

## Privacy note

The recipient email is visible in `config.js` (public repo). After FormSubmit activation you can replace it with the random hash URL FormSubmit provides.

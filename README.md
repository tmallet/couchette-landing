# Couchette — Landing waitlist (premium)

Companion **trains de nuit Europe** — landing marketing FR immersive + capture waitlist.  
**Pas un OTA** : découvrir · comparer · préparer → deep-link opérateur.

## Live

https://cdn.jsdelivr.net/gh/tmallet/couchette-landing@main/index.html

Repo: https://github.com/tmallet/couchette-landing

## Preview locale

```bash
cd couchette-landing
python3 -m http.server 8787
# → http://localhost:8787
```

(FormSubmit nécessite http(s), pas `file://`.)

## Wow factor

- **Train 3D procédural** (Three.js CDN) : loco + wagons, fenêtres cabines chaudes, rails, fog nuit, étoiles
- **Scroll-driven** : le train avance avec le scroll (`#scroll-track` + GSAP ScrollTrigger → `COUCHETTE_TRAIN.setProgress`)
- **GSAP** reveals / hover cards / entrée hero
- **Lenis** soft scroll — **desktop only** (désactivé sur coarse pointer / ≤768px)
- **Fallback** : `prefers-reduced-motion` ou WebGL KO → CSS night scene (pas de boucle 3D)

## Perf / a11y (merged from draft-3d)

- DPR cap (`1.25` mobile / `1.75` desktop) + `powerPreference: low-power` on mobile
- Pause WebGL loop when canvas offscreen (`IntersectionObserver`) or tab hidden
- `prefers-reduced-motion` → 2D CSS fallback, no Lenis / scrub / RAF
- Safer dispose: geometries/materials, `forceContextLoss`, `pagehide`

## Fichiers

```
index.html      Structure + copy FR + commentaires POST pour Dembélé
styles.css      Tokens nuit / or, typo expressive, mobile-first
train3d.js      Three.js procédural + DPR / pause / dispose
animations.js   GSAP ScrollTrigger + Lenis desktop-only + reveals
config.js       FORM_ENDPOINT FormSubmit
app.js          Validation + POST + confirmation + localStorage
waitlist-setup.md
README.md
```

## Stack

- HTML/CSS/JS vanilla — **pas** React / R3F / Vite obligatoire
- Three.js + GSAP ScrollTrigger + Lenis via **CDN**
- Train **procédural** (pas Spline)

## Waitlist (FormSubmit)

Submissions POST → `config.js` (`email`, `country`, `intention`).  
Activation one-shot : voir `waitlist-setup.md`.

```bash
curl -s -X POST https://formsubmit.co/ajax/thibaut3mallet@gmail.com \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"activation-test@example.com","country":"FR","intention":"explore","_subject":"Couchette waitlist activation","_captcha":"false"}'
```

## Proto

https://cdn.jsdelivr.net/gh/tmallet/couchette-proto@main/index.html

## Hors scope

Pas de booking in-app, pas de date de lancement, pas de feature dump.

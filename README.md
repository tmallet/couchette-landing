# Couchette — Landing waitlist (v3 rupture layout)

Companion **trains de nuit Europe** — landing marketing FR + capture waitlist.  
**v3 rupture layout — feedback ThiMal reskin** (16 sep 2026) : plus de hero WebGL full-bleed + cards SaaS ; architecture film / vitre / magazine / ticket.  
**Option B media stub (16 sep 2026)** : vitre = poster + loop Pexels + grain/parallax ; Quaternius / Three.js **dropped**.

**Pas un OTA** : découvrir · comparer · préparer → deep-link opérateur.

## Live

https://tmallet.github.io/couchette-landing/

(jsDelivr mirror: https://cdn.jsdelivr.net/gh/tmallet/couchette-landing@main/index.html)

Repo: https://github.com/tmallet/couchette-landing

## Preview locale

```bash
cd couchette-landing
python3 -m http.server 8787
# → http://localhost:8787
```

(FormSubmit et les médias vidéo nécessitent http(s), pas `file://`.)

## Architecture v3 (rupture)

1. **Title card** plein écran (« Couchette » + une ligne) puis cut
2. **Vitré cabine** : Option B media stub (`#cabin-media` poster + loop) *dans* le cadre (bevel / grain / reflet), pas en fond fixed
3. **Travelling** sticky : scroll vertical → captions Paris→Vienne + léger parallax `#cabin-media`
4. **Spreads magazine** : alternance papier chaud (`#f5f0e8` / `#ebe4d8`) et nuit, asymétrie 40/60, pull quotes — les 3 idées ne sont **pas** des cards
5. **Waitlist ticket** perforé — CTA après le wow
6. Nav minimale (wordmark + lien waitlist)

## Option B — cabin-glass media stub

Interim **Pexels** night-window loop ([video 15161525](https://www.pexels.com/video/15161525/), Pexels License) in `media/` until Kvicha drops final files.

- `#cabin-media` : `<video>` (webm+mp4) + poster + `.film-grade` / `.film-grain`
- `cabin-media.js` : play / `is-ready` / error → poster+fallback / `prefers-reduced-motion` = poster only
- Scroll → subtle parallax CSS vars on `#cabin-media` (+ optional `video.currentTime` scrub)
- Quaternius / Three.js **dropped** (`train3d.js` removed). `models/` may remain on disk unused.
- License note: `media/LICENSE-media.txt`

## Perf / a11y

- Pause video offscreen / tab hidden (`cabin-media.js`)
- Lenis — desktop only
- `prefers-reduced-motion` → poster only, no title card / scrub / Lenis / parallax

## Fichiers

```
index.html      Structure v3 (title card → vitre → magazine → ticket)
styles.css      Layout rupture + cabin-media / film grade+grain
cabin-media.js  Video play + ready/error + reduced-motion
animations.js   Title card + ScrollTrigger route/parallax + reveals
config.js       FORM_ENDPOINT FormSubmit
app.js          Validation + POST + confirmation
media/          Interim poster + webm/mp4 (+ LICENSE-media.txt)
models/         (legacy GLB; unused by Option B stub)
waitlist-setup.md
README.md
```

## Waitlist (FormSubmit)

Champs inchangés : `email`, `country`, `intention` → `config.js`.  
Pas de date de lancement. Activation : voir `waitlist-setup.md`.

## Proto

https://cdn.jsdelivr.net/gh/tmallet/couchette-proto@main/index.html

## Hors scope

Pas de booking in-app, pas de date de lancement, pas de feature dump.

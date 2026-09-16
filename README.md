# Couchette — Landing waitlist (v3 rupture layout)

Companion **trains de nuit Europe** — landing marketing FR + capture waitlist.  
**v3 rupture layout — feedback ThiMal reskin** (16 sep 2026) : plus de hero WebGL full-bleed + cards SaaS ; architecture film / vitre / magazine / ticket.  
**Option B (16 sep 2026)** : vitre = média éditorial (vidéo Pexels), plus de Quaternius / Three.js runtime.

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

(FormSubmit et la vidéo nécessitent http(s), pas `file://`.)

## Architecture v3 (rupture)

1. **Title card** plein écran (« Couchette » + une ligne) puis cut
2. **Vitré cabine** : vidéo éditoriale *dans* le cadre (bevel / reflet / grade film), pas en fond fixed
3. **Travelling** sticky : scroll vertical → Ken Burns léger + captions Paris→Vienne + progress bar
4. **Spreads magazine** : alternance papier chaud (`#f5f0e8` / `#ebe4d8`) et nuit, asymétrie 40/60, pull quotes — les 3 idées ne sont **pas** des cards
5. **Waitlist ticket** perforé — CTA après le wow
6. Nav minimale (wordmark + lien waitlist)

## Média vitre (option B)

- `<video id="cabin-video">` dans `.cabin-glass` / `.cabin-media` — `autoplay muted loop playsinline`
- Asset : **Blurred View of Moving Train at Night** (Yura Forrat) — Pexels License  
  https://www.pexels.com/video/blurred-view-of-moving-train-at-night-36244106/
- Fichiers : `media/cabin-night.mp4` (~2.4 Mo, 1920×1080, ~9.5 s) + `media/cabin-night-poster.jpg`
- Crédits / licence : `media/LICENSE-media.txt`
- Grade film CSS : grain, vignette, color grade ambre/nuit (`.film-grain` / `.glass-vignette` / `.film-grade`)
- Scrub scroll → léger Ken Burns (`--cabin-parallax-*` via `animations.js`) ; API `COUCHETTE_TRAIN` conservée
- `prefers-reduced-motion` → pause vidéo, affiche le poster still
- `train3d.js` = no-op (plus de Three / GLB) ; logique média dans `cabin-media.js`
- GLB Quaternius sous `models/` **non chargés** (archives / historique uniquement)

## Perf / a11y

- Vidéo pausée hors viewport / onglet caché (`cabin-media.js`)
- Lenis — desktop only
- `prefers-reduced-motion` → pas de title card animée / scrub / Lenis / lecture vidéo

## Fichiers

```
index.html      Structure v3 (title card → vitre → magazine → ticket)
styles.css      Layout rupture + grade film vitre
cabin-media.js  Contrôleur <video> + COUCHETTE_TRAIN + reduced-motion
train3d.js      NO-OP (remplace Three/GLB)
animations.js   Title card + ScrollTrigger scrub + Ken Burns + reveals
config.js       FORM_ENDPOINT FormSubmit
app.js          Validation + POST + confirmation
media/          cabin-night.mp4 + poster + LICENSE-media.txt
models/         GLB Quaternius (non utilisés au runtime)
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

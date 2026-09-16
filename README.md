# Couchette — Landing waitlist (Composition 1)

Companion **trains de nuit Europe** — landing marketing FR + capture waitlist.  
**Composition 1 — Éditorial asymétrique** (16 sep 2026) : journey = copy ~42 % gauche + vitre média B ~58 % droite (mock grid), sans chrome player.  
**Option B** : vitre = média éditorial (vidéo Pexels), plus de Quaternius / Three.js runtime.

**Pas un OTA** : découvrir · comparer · préparer → deep-link opérateur.

## Live

https://cdn.jsdelivr.net/gh/tmallet/couchette-landing@main/index.html

Repo: https://github.com/tmallet/couchette-landing

## Handoff (Dembélé → Pages)

Dossier prêt pour push GitHub Pages :

```bash
cd /workspace/couchette-landing
python3 -m http.server 8787   # smoke local
# → http://localhost:8787/
```

Entrée : `index.html`. Assets relatifs (`styles.css`, `*.js`, `media/`).  
Pas de build step. Après push `main` : Pages / jsDelivr CDN ci-dessus.

## Preview locale

```bash
cd couchette-landing
python3 -m http.server 8787
# → http://localhost:8787
```

(FormSubmit et la vidéo nécessitent http(s), pas `file://`.)

## Architecture — Composition 1

1. **Title card** plein écran (« Couchette » + une ligne) puis cut
2. **Journey éditorial asym** : eyebrow + 1 display + 1 companion (gauche) · vitre Option B sans chrome (droite) · micro-légende route 1 ligne sous la vitre (`Paris → Vienne`)
3. **Spreads magazine** : alternance papier chaud / nuit, asymétrie, pull quotes — les 3 idées ne sont **pas** des cards
4. **Waitlist ticket** perforé — CTA après le wow
5. Nav minimale (wordmark + lien waitlist)

**Droppé vs sticky player :** `journey-sticky`, `#scroll-track` scrub, progress bar, sill « Vitré · nuit », stack captions multi-routes.

## Média vitre (option B)

- `<video id="cabin-video">` dans `.cabin-glass` / `.cabin-media` — `autoplay muted loop playsinline`
- Asset : **Blurred View of Moving Train at Night** (Yura Forrat) — Pexels License  
  https://www.pexels.com/video/blurred-view-of-moving-train-at-night-36244106/
- Fichiers : `media/cabin-night.mp4` (~2.4 Mo, 1920×1080, ~9.5 s) + `media/cabin-night-poster.jpg`
- Crédits / licence : `media/LICENSE-media.txt`
- Grade film CSS : grain, vignette, color grade ambre/nuit (`.film-grain` / `.glass-vignette` / `.film-grade`)
- `prefers-reduced-motion` → pause vidéo, affiche le poster still
- `train3d.js` = no-op ; logique média dans `cabin-media.js` (plus de scrub parallax)
- Mock référence : `layout-mocks/01-editorial-asym.html`

## Perf / a11y

- Vidéo pausée hors viewport / onglet caché (`cabin-media.js`)
- Lenis — desktop only
- `prefers-reduced-motion` → pas de title card animée / Lenis / lecture vidéo

## Fichiers

```
index.html      Composition 1 (title card → journey asym → magazine → ticket)
styles.css      Grille éditoriale + vitre discrète (sans sticky/progress)
cabin-media.js  Contrôleur <video> + reduced-motion (setProgress no-op)
train3d.js      NO-OP
animations.js   Title card + reveals (plus de scrub #scroll-track)
config.js       FORM_ENDPOINT FormSubmit
app.js          Validation + POST + confirmation
media/          cabin-night.mp4 + poster + LICENSE-media.txt
layout-mocks/   Références composition (01 éditorial asym = live)
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

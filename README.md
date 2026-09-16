# Couchette — Landing waitlist (Cabin light)

Companion **trains de nuit Europe** — landing marketing FR immersive + capture waitlist.  
**Direction :** Cabin light (cinéma nocturne européen) — go ThiMal 16 sep 2026.  
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

## Direction Cabin light

- Mood : vitres, lueur couchette, paysage qui défile — pas luxe palace, pas SaaS, **pas** reskin proto (navy + `#d4a84b` chips).
- Palette : encre `#05080f`, bleu nuit `#0a1628`, mid `#15232E`, ambre `#f0b46a` / glow `#FF9E5C` (rare), laiton `#c9a36a`, papier `#f5f0e8`.
- Typo : **Fraunces** (display) + **DM Sans** (UI).
- Parcours : hero immersif → scroll-scrub train 3D → promesse companion → 3 idées éditoriales → CTA waitlist → proto discret → note pas OTA.

## Train 3D

- Canvas `#train-canvas` + API `COUCHETTE_TRAIN.setProgress(t)` (GSAP ScrollTrigger scrub sur `#scroll-track`).
- GLB sous **`models/`** : **Kenney Train Kit** CC0 (fallback — Poly Pizza / Quaternius Modular Train bloqué au download) :
  - `loco.glb`, `wagon.glb`, `rail.glb` + `LICENSE-kenney.txt`
  - Source : https://kenney.nl/assets/train-kit
- `train3d.js` : loader GLTF en cours (parallèle Dembélé) ; API `setProgress` conservée. Procédural encore en place tant que le loader n’est pas branché.
- Crédit footer : « Train 3D : Kenney Train Kit (CC0) ».
- Fallback motion : `prefers-reduced-motion` ou WebGL KO → CSS night scene.

## Perf / a11y

- DPR cap + pause offscreen / tab hidden (voir `train3d.js`)
- Lenis soft scroll — **desktop only**
- `prefers-reduced-motion` → pas de scrub / Lenis / RAF 3D

## Fichiers

```
index.html      Structure + copy FR Cabin light
styles.css      Tokens Cabin light + typo éditoriale
train3d.js      Three.js + (GLB Quaternius / fallback procédural)
animations.js   GSAP ScrollTrigger + Lenis + reveals
config.js       FORM_ENDPOINT FormSubmit
app.js          Validation + POST + confirmation
models/         GLB Quaternius (loco + carriages)
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

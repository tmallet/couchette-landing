# Couchette — Landing waitlist (v3 rupture layout)

Companion **trains de nuit Europe** — landing marketing FR + capture waitlist.  
**v3 rupture layout — feedback ThiMal reskin** (16 sep 2026) : plus de hero WebGL full-bleed + cards SaaS ; architecture film / vitre / magazine / ticket.

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

(FormSubmit et les modules ES / GLB nécessitent http(s), pas `file://`.)

## Architecture v3 (rupture)

1. **Title card** plein écran (« Couchette » + une ligne) puis cut
2. **Vitré cabine** : `#train-canvas` vit *dans* le cadre (bevel / reflet), pas en fond fixed
3. **Travelling** sticky : scroll vertical → scrub `COUCHETTE_TRAIN.setProgress` + captions Paris→Vienne
4. **Spreads magazine** : alternance papier chaud (`#f5f0e8` / `#ebe4d8`) et nuit, asymétrie 40/60, pull quotes — les 3 idées ne sont **pas** des cards
5. **Waitlist ticket** perforé — CTA après le wow
6. Nav minimale (wordmark + lien waitlist)

## Train 3D

- Canvas `#train-canvas` dans `.scene-stage` (intérieur vitre) + API `COUCHETTE_TRAIN.setProgress(t)`
- Scrub GSAP ScrollTrigger sur `#scroll-track`
- GLB Quaternius sous `models/` (CC0) — voir `MERGE.md`
- Fallback CSS si WebGL / `prefers-reduced-motion`

## Perf / a11y

- DPR cap + pause offscreen / tab hidden (`train3d.js`)
- Lenis — desktop only
- `prefers-reduced-motion` → pas de title card animée / scrub / Lenis / RAF 3D

## Fichiers

```
index.html      Structure v3 (title card → vitre → magazine → ticket)
styles.css      Layout rupture (papier/nuit, cadre vitre, ticket)
train3d.js      Three.js + GLB (taille = vitre, pas viewport plein)
animations.js   Title card + ScrollTrigger scrub + reveals
config.js       FORM_ENDPOINT FormSubmit
app.js          Validation + POST + confirmation
models/         GLB Quaternius
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

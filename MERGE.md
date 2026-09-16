# MERGE notes — train3d (GLB) → Kvicha

## What changed (this PR slice)

- `train3d.js` rewritten as an **ES module**: imports Three r160 + `GLTFLoader` from jsDelivr, loads real GLBs instead of procedural boxes.
- Public API unchanged for `animations.js`:

```js
window.COUCHETTE_TRAIN = {
  progress,          // 0..1 (live)
  setProgress(t),    // scrub from ScrollTrigger / Lenis
  destroy(),         // RAF + listeners + GPU dispose
};
```

- Canvas: `#train-canvas`. Fallback: `#scene-fallback` + `body.is-reduced-motion`.

## HTML change required (Kvicha)

In `index.html`, change the train script tag to a module (duplicate `three.min.js` global is unused by train3d now and may be removed later):

```html
<!-- before -->
<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
…
<script src="train3d.js"></script>

<!-- after -->
<script type="module" src="train3d.js"></script>
```

Keep GSAP / Lenis / `animations.js` / `app.js` as classic scripts. Module scripts defer, so `train3d.js` installs a stub `COUCHETTE_TRAIN` immediately on first line execution after parse — scrub stays safe.

## Models (paths)

On disk under `models/` (served as static files):

| Role | Preferred (if present) | Fallback |
|------|------------------------|----------|
| Locomotive (Front) | `models/quaternius-loco-front.glb` | `models/loco.glb` |
| Passenger carriage | `models/quaternius-carriage.glb` | `models/wagon.glb` |
| Freight wagon | `models/quaternius-wagon.glb` | `models/wagon-b.glb` |
| Rail segment | `models/quaternius-rail.glb` | `models/rail.glb` |

Composition: **1× Front + Passenger Carriage + Wagon** (+ second carriage on desktop), rails repeated along Z. Night fog `#0a0e18`, amber cabin emissive on `Windows`-named mats + PointLights.

### Quaternius swap

Files already use Quaternius Modular Train Pack (CC0). When adding/replacing assets, drop new GLBs as `models/quaternius-*.glb` (or overwrite short names). Loader picks the first URL that loads successfully — no JS edit needed if you keep the candidate lists above.

Kenney interim (`LICENSE-kenney.txt`) may remain for history; **runtime models are Quaternius**.

## Credits (CC0)

- **Quaternius** — Modular Train Pack (CC0). See `models/LICENSE-quaternius.txt`.
- Kenney Train Kit was an interim placeholder only (`models/LICENSE-kenney.txt`).

## How to test

```bash
cd couchette-landing
python3 -m http.server 8080
# open http://localhost:8080 — modules need HTTP, not file://
```

Checks: train silhouette readable, scroll scrubs train + camera arc, reduced-motion → CSS fallback, tab hide pauses RAF, `COUCHETTE_TRAIN.destroy()` cleans up.

## Do not

- Rewrite `styles.css` / `app.js` / `config.js` for this merge.
- Expect `file://` to load ES module CDN imports (CORS).

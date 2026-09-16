# Layout mocks — vitre Couchette

**Date :** 16 sep 2026 (Europe/Paris)  
**Brief :** feedback ThiMal — composition cheap, pas le média. Option B conservée (vidéo + poster dans la vitre).  
**Update Marquinhos :** priorité présentation PM = cinéma plein cadre → asym → spread.  
**OUT :** progress bar, scrubber, chrome player, stack labels. Route = 1 ligne max. Une accroche seule.

## Fichiers

| Ordre PM | Fichier | Idée |
|----------|---------|------|
| **1** | `02-cinema-bleed.html` | Vitre quasi plein cadre, typo overlay minimale en bas |
| **2** | `01-editorial-asym.html` | Colonne copy gauche + vitre ~55–65 % droite |
| **3** | `03-spread-type.html` | Typo display dominante + vitre portrait « photo mag » |
| — | `index.html` | Liens + une phrase chacune (ordre PM) |

## Pros / cons

### 02 — Cinéma bleed (reco PM)

- **Pros :** Immersion maximale ; le média porte l’émotion ; zéro chrome ; lecture « générique de film » ; aligné Cabin light / Wagon Cinéma ; idéal pour pitch PM.
- **Cons :** Peu de place pour messaging produit ; mobile = overlay sur média (contraste à surveiller) ; moins « magazine » si la marque veut plus d’éditorial.

### 01 — Éditorial asymétrique

- **Pros :** Hiérarchie claire (eyebrow → route → accroche) ; vitre comme objet premium, pas fond ; rythme magazine ; bon compromis wow / copy.
- **Cons :** Moins immersif que le bleed ; risque de re-tomber dans un split SaaS si les marges / le cadre se chargent ; mobile empile (copy puis vitre).

### 03 — Spread typo

- **Pros :** Look éditorial fort (papier chaud) ; vitre = illustration, pas player ; typo Fraunces mise en avant ; différencie net du proto navy/gold.
- **Cons :** Moins « wow nuit » au premier viewport ; la vidéo portrait croppe le travelling horizontal ; peut paraître section magazine plutôt que moment journey.

## Recommandation provisoire

**Pour la prés. PM :** ouvrir sur **`02-cinema-bleed.html`**.

C’est la lecture la plus nette du feedback composition (pas de gadget UI) tout en gardant l’option B. Si Marquinhos/Luis veulent plus de copy visible dès le journey, basculer vers **01-editorial-asym** en production, et garder le bleed comme variante hero / moment immersif.

**Ne pas réintroduire :** progress bar gamey, scrubber, labels type « VITRÉ · NUIT », chrome player, stack de routes animées.

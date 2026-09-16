/**
 * Couchette — night train (Three.js ES module + GLTFLoader)
 * Loads Quaternius Modular Train Pack GLBs (CC0). Scroll-driven via
 * window.COUCHETTE_TRAIN.setProgress(0..1).
 *
 * Kvicha: load with <script type="module" src="train3d.js"></script>
 * (see MERGE.md). Duplicate global three.min.js can stay or be removed.
 */
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

(function () {
  "use strict";

  var DPR_MOBILE = 1.5;
  var DPR_DESKTOP = 1.75;
  var MOBILE_MQ = "(max-width: 768px), (pointer: coarse)";
  var REDUCED_MQ = "(prefers-reduced-motion: reduce)";
  var FOG = 0x0a0e18;
  var CABIN = 0xffb56a;

  /* Prefer quaternius-* aliases when present; else short names on disk. */
  var MODEL_CANDIDATES = {
    loco: ["models/quaternius-loco-front.glb", "models/loco.glb"],
    carriage: ["models/quaternius-carriage.glb", "models/wagon.glb"],
    wagon: ["models/quaternius-wagon.glb", "models/wagon-b.glb"],
    rail: ["models/quaternius-rail.glb", "models/rail.glb"],
  };

  var canvas = document.getElementById("train-canvas");
  var fallback = document.getElementById("scene-fallback");
  var stage = document.querySelector(".scene-stage");
  if (!canvas) return;

  var progress = 0;
  var targetProgress = 0;

  /* Stub API immediately so animations.js scrub never races a missing export. */
  window.COUCHETTE_TRAIN = {
    progress: 0,
    setProgress: function (t) {
      targetProgress = Math.max(0, Math.min(1, Number(t) || 0));
      window.COUCHETTE_TRAIN.progress = targetProgress;
    },
    destroy: function () {},
  };

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia(REDUCED_MQ).matches;
  }

  function isMobile() {
    return window.matchMedia && window.matchMedia(MOBILE_MQ).matches;
  }

  function enableFallback() {
    canvas.style.display = "none";
    if (fallback) fallback.classList.add("is-on");
    document.body.classList.add("is-reduced-motion");
  }

  if (prefersReducedMotion()) {
    enableFallback();
    return;
  }

  var renderer, scene, camera, trainGroup, railsGroup, stars;
  var cabinLights = [];
  var clock = new THREE.Clock();
  var raf = 0;
  var disposed = false;
  var running = false;
  var canvasVisible = true;
  var observer = null;
  var loadedUrls = {};

  function dprCap() {
    return isMobile() ? DPR_MOBILE : DPR_DESKTOP;
  }

  function loadFirstAvailable(loader, urls) {
    var i = 0;
    function next() {
      if (i >= urls.length) {
        return Promise.reject(new Error("No model found: " + urls.join(", ")));
      }
      var url = urls[i++];
      return loader.loadAsync(url).then(
        function (gltf) {
          return { url: url, gltf: gltf };
        },
        function () {
          return next();
        }
      );
    }
    return next();
  }

  /**
   * Quaternius FBX2glTF assets sit length-along-X after the -90°X bake.
   * Normalize: longest horizontal axis → +Z, wheels on y=0, centered X.
   */
  function prepareAsset(root) {
    var wrap = new THREE.Group();
    wrap.add(root);
    wrap.updateMatrixWorld(true);

    var box = new THREE.Box3().setFromObject(wrap);
    var size = new THREE.Vector3();
    var center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    root.position.sub(center);
    wrap.updateMatrixWorld(true);
    box.setFromObject(wrap);
    box.getSize(size);
    box.getCenter(center);

    /* Rotate so longest horizontal extent follows Z (track axis). */
    if (size.x > size.z) {
      wrap.rotation.y = -Math.PI / 2;
      wrap.updateMatrixWorld(true);
      box.setFromObject(wrap);
      box.getSize(size);
      box.getCenter(center);
      wrap.position.x -= center.x;
      wrap.position.z -= center.z;
    }

    wrap.updateMatrixWorld(true);
    box.setFromObject(wrap);
    wrap.position.y -= box.min.y;

    wrap.updateMatrixWorld(true);
    box.setFromObject(wrap);
    box.getSize(size);
    wrap.userData.lengthZ = size.z;
    wrap.userData.heightY = size.y;
    wrap.userData.widthX = size.x;
    /* Lift dark Quaternius albedos for night readability in glass */
    wrap.traverse(function (obj) {
      if (!obj.isMesh || !obj.material) return;
      var mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach(function (m) {
        if (!m || !m.color) return;
        m.color.offsetHSL(0, 0.02, 0.08);
        if (m.roughness != null) m.roughness = Math.min(0.92, (m.roughness || 0.7) * 0.95);
        m.needsUpdate = true;
      });
    });
    return wrap;
  }

  function clonePrepared(template) {
    var c = template.clone(true);
    c.traverse(function (obj) {
      if (obj.isMesh && obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material = obj.material.map(function (m) {
            return m.clone();
          });
        } else {
          obj.material = obj.material.clone();
        }
      }
    });
    c.userData.lengthZ = template.userData.lengthZ;
    c.userData.heightY = template.userData.heightY;
    c.userData.widthX = template.userData.widthX;
    return c;
  }

  function enhanceCabinGlow(root, intensity) {
    intensity = intensity == null ? 1 : intensity;
    root.traverse(function (obj) {
      if (!obj.isMesh || !obj.material) return;
      var mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      var nameHit =
        /window|glass|cabin|light/i.test(obj.name || "") ||
        mats.some(function (m) {
          return /window|glass|emissive|light/i.test((m && m.name) || "");
        });
      if (!nameHit) return;
      mats.forEach(function (m) {
        if (!m) return;
        m.emissive = new THREE.Color(CABIN);
        m.emissiveIntensity = 2.1 * intensity;
        m.toneMapped = true;
        if (m.transparent || m.opacity < 1) {
          m.transparent = true;
          m.opacity = Math.max(m.opacity || 0.85, 0.75);
        }
        m.needsUpdate = true;
      });
    });
  }

  function addCabinLights(group, lengthZ, count, intensity) {
    count = count || 3;
    intensity = intensity == null ? 0.65 : intensity;
    var half = lengthZ * 0.35;
    for (var i = 0; i < count; i++) {
      var t = count === 1 ? 0.5 : i / (count - 1);
      var z = -half + t * half * 2;
      var light = new THREE.PointLight(CABIN, intensity, Math.max(6, lengthZ * 1.4), 2);
      light.position.set(0, 1.15, z);
      group.add(light);
      cabinLights.push(light);
    }
  }

  function buildAtmosphere() {
    var mobile = isMobile();
    /* Cabin-glass shot: keep night mood but keep train readable */
    scene.fog = new THREE.FogExp2(FOG, mobile ? 0.012 : 0.008);
    scene.background = new THREE.Color(FOG);

    scene.add(new THREE.AmbientLight(0x3a4a68, 0.85));
    scene.add(new THREE.HemisphereLight(0x6a7a9a, 0x1a1208, 0.55));

    var moon = new THREE.DirectionalLight(0xb0c4e8, 0.75);
    moon.position.set(-10, 18, 8);
    scene.add(moon);

    var key = new THREE.DirectionalLight(0xffc078, 0.55);
    key.position.set(6, 5, 4);
    scene.add(key);

    var rim = new THREE.DirectionalLight(0xd4a84b, 0.35);
    rim.position.set(8, 6, -4);
    scene.add(rim);
  }

  function buildStars() {
    var count = isMobile() ? 260 : 850;
    var pos = new Float32Array(count * 3);
    for (var i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 120;
      pos[i * 3 + 1] = Math.random() * 50 + 5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 160 - 20;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    stars = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        color: 0xc8d0e0,
        size: 0.12,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      })
    );
    scene.add(stars);
  }

  function buildRails(railTemplate) {
    railsGroup = new THREE.Group();
    var segLen = Math.max(railTemplate.userData.lengthZ || 10, 4);
    var count = isMobile() ? 28 : 42;
    var startZ = 24;

    for (var i = 0; i < count; i++) {
      var seg = clonePrepared(railTemplate);
      seg.position.z = startZ - i * segLen;
      railsGroup.add(seg);
    }

    var ground = new THREE.Mesh(
      new THREE.PlaneGeometry(36, count * segLen + 40),
      new THREE.MeshStandardMaterial({
        color: 0x080c14,
        roughness: 1,
        metalness: 0,
      })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.02, startZ - (count * segLen) / 2);
    railsGroup.add(ground);

    scene.add(railsGroup);
    return segLen;
  }

  function buildTrain(locoT, carriageT, wagonT) {
    trainGroup = new THREE.Group();
    cabinLights = [];
    var gap = 0.35;
    var cursor = 0;

    function place(template, glow, lights, lightInt) {
      var piece = clonePrepared(template);
      var len = piece.userData.lengthZ || 5;
      /* Nose toward +Z (travel direction into night is −Z for group). */
      piece.position.z = cursor - len / 2;
      cursor -= len + gap;
      enhanceCabinGlow(piece, glow);
      addCabinLights(piece, len, lights, lightInt);
      trainGroup.add(piece);
      return piece;
    }

    place(locoT, 0.9, 2, 0.55);
    place(carriageT, 1.25, 3, 0.75);
    place(wagonT, 0.7, 2, 0.45);
    if (!isMobile()) {
      place(carriageT, 1.15, 3, 0.7);
    }

    /* Headlight on loco nose (+Z end of first child). */
    var head = new THREE.SpotLight(0xffe0b0, 1.35, 48, Math.PI / 7, 0.45, 1);
    head.position.set(0, 1.1, 0.6);
    head.target.position.set(0, 0.4, 22);
    trainGroup.add(head);
    trainGroup.add(head.target);

    trainGroup.position.set(0, 0, 0);
    /* Fill cabin glass: Quaternius packs are small — scale up for silhouette */
    var trainScale = isMobile() ? 1.85 : 2.15;
    trainGroup.scale.setScalar(trainScale);
    scene.add(trainGroup);
  }

  function setProgress(p) {
    targetProgress = Math.max(0, Math.min(1, Number(p) || 0));
  }

  function updateScene(dt, t) {
    progress += (targetProgress - progress) * Math.min(1, dt * 4);

    if (trainGroup) {
      trainGroup.position.z = -(progress * 58);
      trainGroup.position.y = Math.sin(t * 2.2 + progress * 4) * 0.02;
      trainGroup.rotation.z = Math.sin(t * 1.4) * 0.006;
      trainGroup.rotation.x = Math.sin(t * 0.9) * 0.003;
    }

    if (camera) {
      /* 3/4 side view through sleeper glass — fill frame */
      var lookZ = -1.2 - progress * 36;
      var camZ = 3.2 - progress * 8;
      var camX = 4.6 - progress * 0.6;
      var camY = 1.85 + progress * 0.25;
      camera.position.x += (camX - camera.position.x) * 0.12;
      camera.position.y += (camY - camera.position.y) * 0.12;
      camera.position.z += (camZ - camera.position.z) * 0.12;
      camera.lookAt(0.1, 1.15, lookZ);
    }

    for (var i = 0; i < cabinLights.length; i++) {
      var base = 0.5 + (i % 3) * 0.08;
      cabinLights[i].intensity = base + Math.sin(t * 3 + i * 1.7) * 0.07;
    }

    if (stars) stars.rotation.y = t * 0.004;
  }

  function renderOnce() {
    if (disposed || !renderer) return;
    var dt = Math.min(clock.getDelta(), 0.05);
    updateScene(dt, clock.elapsedTime);
    renderer.render(scene, camera);
  }

  function startLoop() {
    if (running || disposed) return;
    if (document.hidden || !canvasVisible) return;
    running = true;
    var tick = function () {
      if (!running || disposed) return;
      renderOnce();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }

  function stopLoop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function onVisibility() {
    if (document.hidden) stopLoop();
    else if (canvasVisible && !disposed) startLoop();
  }

  function setupVisibility() {
    var target = stage || canvas;
    if ("IntersectionObserver" in window && target) {
      observer = new IntersectionObserver(
        function (entries) {
          canvasVisible = entries.some(function (e) {
            return e.isIntersecting;
          });
          if (canvasVisible) startLoop();
          else {
            stopLoop();
            renderOnce();
          }
        },
        { threshold: 0.05 }
      );
      observer.observe(target);
    } else {
      canvasVisible = true;
    }
    document.addEventListener("visibilitychange", onVisibility);
  }

  function viewportSize() {
    var glass = document.querySelector(".cabin-glass");
    var el = glass || stage || canvas;
    var w = (el && el.clientWidth) || canvas.clientWidth || window.innerWidth;
    var h = (el && el.clientHeight) || canvas.clientHeight || Math.round(w * 9 / 16);
    return { w: Math.max(1, w), h: Math.max(1, h) };
  }

  function onResize() {
    if (!renderer || !camera || disposed) return;
    var size = viewportSize();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap()));
    renderer.setSize(size.w, size.h, false);
    camera.aspect = size.w / size.h;
    camera.updateProjectionMatrix();
  }

  function destroy() {
    if (disposed) return;
    disposed = true;
    stopLoop();
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("pagehide", destroy);
    if (observer) {
      try {
        observer.disconnect();
      } catch (_) {}
      observer = null;
    }
    if (scene) {
      scene.traverse(function (obj) {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(function (m) {
              if (m && m.dispose) m.dispose();
            });
          } else if (obj.material.dispose) {
            obj.material.dispose();
          }
        }
      });
    }
    if (renderer) {
      renderer.dispose();
      if (renderer.forceContextLoss) renderer.forceContextLoss();
    }
  }

  async function init() {
    var size = viewportSize();
    var mobile = isMobile();

    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: !mobile,
      alpha: true,
      powerPreference: mobile ? "low-power" : "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap()));
    renderer.setSize(size.w, size.h, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(34, size.w / size.h, 0.1, 220);
    camera.position.set(4.6, 1.85, 3.2);
    camera.lookAt(0.1, 1.15, -1.2);

    buildAtmosphere();
    buildStars();

    var loader = new GLTFLoader();
    var locoRes = await loadFirstAvailable(loader, MODEL_CANDIDATES.loco);
    var carriageRes = await loadFirstAvailable(loader, MODEL_CANDIDATES.carriage);
    var wagonRes = await loadFirstAvailable(loader, MODEL_CANDIDATES.wagon);
    var railRes = await loadFirstAvailable(loader, MODEL_CANDIDATES.rail);

    loadedUrls = {
      loco: locoRes.url,
      carriage: carriageRes.url,
      wagon: wagonRes.url,
      rail: railRes.url,
    };
    console.info("[Couchette train3d] models", loadedUrls);

    var locoT = prepareAsset(locoRes.gltf.scene);
    var carriageT = prepareAsset(carriageRes.gltf.scene);
    var wagonT = prepareAsset(wagonRes.gltf.scene);
    var railT = prepareAsset(railRes.gltf.scene);

    buildRails(railT);
    buildTrain(locoT, carriageT, wagonT);

    canvas.classList.add("is-ready");
    setupVisibility();
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("pagehide", destroy, { once: true });
    renderOnce();
    startLoop();
  }

  window.COUCHETTE_TRAIN.setProgress = setProgress;
  window.COUCHETTE_TRAIN.destroy = destroy;
  Object.defineProperty(window.COUCHETTE_TRAIN, "progress", {
    get: function () {
      return progress;
    },
    set: function (v) {
      setProgress(v);
    },
    configurable: true,
  });

  init().catch(function (err) {
    console.warn("[Couchette train3d]", err);
    destroy();
    enableFallback();
  });
})();

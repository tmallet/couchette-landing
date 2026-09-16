/**
 * Couchette v3 — title card + vitre travelling + magazine reveals
 * Scrub #scroll-track → route captions + subtle #cabin-media parallax
 * prefers-reduced-motion: skip Lenis / scrub / fancy reveals
 */
(function () {
  "use strict";

  document.documentElement.classList.add("js-ready");

  var MOBILE_MQ = "(max-width: 768px), (pointer: coarse)";
  var REDUCED_MQ = "(prefers-reduced-motion: reduce)";

  var reduceMotion =
    window.matchMedia && window.matchMedia(REDUCED_MQ).matches;
  var isMobile =
    window.matchMedia && window.matchMedia(MOBILE_MQ).matches;

  var titleCard = document.getElementById("title-card");
  var nav = document.getElementById("site-nav");
  var reveals = document.querySelectorAll("[data-reveal]");
  var routeEl = document.getElementById("journey-route");
  var noteEl = document.getElementById("journey-note");
  var progressBar = document.getElementById("journey-progress-bar");
  var track = document.getElementById("scroll-track");
  var cabinMedia = document.getElementById("cabin-media");
  var cabinVideo = document.getElementById("cabin-video");

  var ROUTES = ["Paris → Strasbourg", "Strasbourg → Munich", "Munich → Vienne", "Vienne → Budapest"];
  var NOTES = [
    "Le paysage défile. Vous restez.",
    "Les lumières de la ville s’effacent.",
    "Couloir, couchette, silence.",
    "À l’aube, une autre gare.",
  ];

  try {
    if (routeEl && routeEl.dataset.routes) {
      var parsed = JSON.parse(routeEl.dataset.routes);
      if (Array.isArray(parsed) && parsed.length) ROUTES = parsed;
    }
  } catch (e) {}


  function applyCabinParallax(progress) {
    if (!cabinMedia || reduceMotion) return;
    var p = Math.max(0, Math.min(1, progress));
    /* Subtle Ken Burns — media oversized via CSS inset; leave video looping */
    var x = (p - 0.5) * -2.4; /* % */
    var y = (p - 0.5) * 1.2;
    var scale = 1.06 + p * 0.04;
    cabinMedia.style.setProperty("--cabin-parallax-x", x.toFixed(3) + "%");
    cabinMedia.style.setProperty("--cabin-parallax-y", y.toFixed(3) + "%");
    cabinMedia.style.setProperty("--cabin-parallax-scale", scale.toFixed(4));
  }

  function setRoute(progress) {
    var idx = Math.min(
      ROUTES.length - 1,
      Math.floor(progress * ROUTES.length)
    );
    if (progress >= 0.999) idx = ROUTES.length - 1;
    if (routeEl && ROUTES[idx] && routeEl.textContent !== ROUTES[idx]) {
      routeEl.textContent = ROUTES[idx];
    }
    if (noteEl && NOTES[idx] && noteEl.textContent !== NOTES[idx]) {
      noteEl.textContent = NOTES[idx];
    }
    if (progressBar) {
      progressBar.style.width = Math.round(progress * 100) + "%";
    }
  }

  function syncNavTheme() {
    if (!nav || !nav.classList.contains("is-on")) return;
    var paper = document.querySelector(".spread-paper, .nota-band");
    var samples = document.elementsFromPoint
      ? document.elementsFromPoint(window.innerWidth / 2, 28)
      : [];
    var onPaper = false;
    for (var i = 0; i < samples.length; i++) {
      var el = samples[i];
      if (
        el.classList &&
        (el.classList.contains("spread-paper") ||
          el.classList.contains("nota-band") ||
          (el.closest && (el.closest(".spread-paper") || el.closest(".nota-band"))))
      ) {
        onPaper = true;
        break;
      }
    }
    /* Fallback without elementsFromPoint */
    if (!samples.length) {
      var y = window.scrollY + 40;
      document.querySelectorAll(".spread-paper, .nota-band").forEach(function (sec) {
        var r = sec.getBoundingClientRect();
        var top = r.top + window.scrollY;
        if (y >= top && y <= top + r.height) onPaper = true;
      });
    }
    nav.classList.toggle("is-paper", onPaper);
  }

  function finishTitleCard() {
    if (titleCard) {
      titleCard.classList.add("is-done");
      titleCard.setAttribute("aria-hidden", "true");
    }
    if (nav) nav.classList.add("is-on");
    syncNavTheme();
  }

  function onScrollNav() {
    syncNavTheme();
  }

  /* ——— Reduced motion: skip film + scrub ——— */
  if (reduceMotion) {
    document.body.classList.add("is-reduced-motion");
    finishTitleCard();
    reveals.forEach(function (el) {
      el.classList.add("is-in");
    });
    window.addEventListener("scroll", onScrollNav, { passive: true });
    setRoute(0);
    return;
  }

  /* ——— Title card cut ——— */
  function playTitleCard(done) {
    if (!titleCard || typeof gsap === "undefined") {
      finishTitleCard();
      if (done) done();
      return;
    }
    var word = titleCard.querySelector(".title-card-word");
    var line = titleCard.querySelector(".title-card-line");
    var tl = gsap.timeline({
      onComplete: function () {
        finishTitleCard();
        if (done) done();
      },
    });
    gsap.set([word, line], { autoAlpha: 0, y: 16 });
    tl.to(word, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out" }, 0.15)
      .to(line, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out" }, 0.45)
      .to(titleCard, { autoAlpha: 0, duration: 0.55, ease: "power2.inOut" }, 1.85)
      .set(titleCard, { display: "none" });
  }

  /* ——— Lenis desktop ——— */
  var lenis = null;
  if (typeof Lenis !== "undefined" && !isMobile) {
    try {
      lenis = new Lenis({
        duration: 1.15,
        easing: function (t) {
          return Math.min(1, 1.001 - Math.pow(2, -10 * t));
        },
        smoothWheel: true,
        syncTouch: false,
      });
      lenis.on("scroll", onScrollNav);
      document.documentElement.classList.add("lenis");
    } catch (e) {
      console.info("[Couchette animations] Lenis skipped", e);
      lenis = null;
    }
  }
  if (!lenis) {
    window.addEventListener("scroll", onScrollNav, { passive: true });
  }

  /* ——— No GSAP fallback ——— */
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    playTitleCard();
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              e.target.classList.add("is-in");
              e.target.style.transition =
                "opacity 0.7s ease, transform 0.7s ease";
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
      );
      reveals.forEach(function (el) {
        io.observe(el);
      });
    } else {
      reveals.forEach(function (el) {
        el.classList.add("is-in");
      });
    }

    function crudeProgress() {
      if (!track) return;
      var rect = track.getBoundingClientRect();
      var total = track.offsetHeight || 1;
      var seen = -rect.top;
      var p = Math.max(0, Math.min(1, seen / total));
      applyCabinParallax(p);
      setRoute(p);
    }
    window.addEventListener("scroll", crudeProgress, { passive: true });
    crudeProgress();

    if (lenis) {
      function rafLenis(time) {
        lenis.raf(time);
        requestAnimationFrame(rafLenis);
      }
      requestAnimationFrame(rafLenis);
    }
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  playTitleCard(function () {
    ScrollTrigger.refresh();
  });

  /* Section reveals */
  gsap.utils.toArray("[data-reveal]").forEach(function (el) {
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 36 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.95,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          toggleActions: "play none none none",
        },
        onComplete: function () {
          el.classList.add("is-in");
        },
      }
    );
  });

  /* Cabin media parallax + route scrub on sticky journey track */
  var scrubAmt = isMobile ? 0.55 : 0.8;
  if (track) {
    ScrollTrigger.create({
      trigger: track,
      start: "top top",
      end: "bottom bottom",
      scrub: scrubAmt,
      onUpdate: function (self) {
        var p = self.progress;
        applyCabinParallax(p);
        if (window.COUCHETTE_TRAIN && window.COUCHETTE_TRAIN.setProgress) {
          window.COUCHETTE_TRAIN.setProgress(p);
        }
        setRoute(p);
      },
    });
  }

  /* Soft fade of captions while scrubbing */
  var captions = document.querySelector(".journey-captions");
  if (captions && track) {
    ScrollTrigger.create({
      trigger: track,
      start: "top top",
      end: "bottom bottom",
      onUpdate: function () {
        /* keep captions visible — no fade needed */
      },
    });
  }
})();

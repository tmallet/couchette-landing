/**
 * Couchette v3 — Composition 1
 * Title card + magazine reveals (no journey scrub / #scroll-track)
 * Optional light vitre parallax on #journey only — no progress bar / route captions
 * prefers-reduced-motion: skip Lenis / fancy reveals / parallax
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
  var journey = document.getElementById("journey");
  var cabinMedia = document.getElementById("cabin-media");

  function syncNavTheme() {
    if (!nav || !nav.classList.contains("is-on")) return;
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

  /* Soft vitre drift — no #scroll-track / progress / route captions */
  function applyLightParallax() {
    if (!cabinMedia || !journey || reduceMotion) return;
    var rect = journey.getBoundingClientRect();
    var vh = window.innerHeight || 1;
    var mid = rect.top + rect.height / 2;
    var p = 1 - Math.max(0, Math.min(1, mid / vh));
    var y = (p - 0.5) * 8; /* px */
    cabinMedia.style.transform =
      "translate3d(0," + y.toFixed(2) + "px,0) scale(1.02)";
  }

  /* ——— Reduced motion: skip film ——— */
  if (reduceMotion) {
    document.body.classList.add("is-reduced-motion");
    finishTitleCard();
    reveals.forEach(function (el) {
      el.classList.add("is-in");
    });
    window.addEventListener("scroll", onScrollNav, { passive: true });
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
      lenis.on("scroll", function () {
        onScrollNav();
        applyLightParallax();
      });
      document.documentElement.classList.add("lenis");
    } catch (e) {
      console.info("[Couchette animations] Lenis skipped", e);
      lenis = null;
    }
  }
  if (!lenis) {
    window.addEventListener(
      "scroll",
      function () {
        onScrollNav();
        applyLightParallax();
      },
      { passive: true }
    );
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

    applyLightParallax();

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

  /* Light vitre parallax — Composition 1 (no scrub track) */
  if (journey && cabinMedia) {
    ScrollTrigger.create({
      trigger: journey,
      start: "top bottom",
      end: "bottom top",
      scrub: 0.6,
      onUpdate: function () {
        applyLightParallax();
      },
    });
  }

  applyLightParallax();
})();

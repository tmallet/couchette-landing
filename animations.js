/**
 * Couchette — scroll + reveal (GSAP ScrollTrigger + Lenis)
 * Wires #scroll-track progress → COUCHETTE_TRAIN.setProgress
 * prefers-reduced-motion: skip Lenis / scrub / fancy reveals
 * Lenis: desktop-only (disabled on coarse pointer / small screens)
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

  var header = document.querySelector(".site-header");
  var reveals = document.querySelectorAll("[data-reveal]");

  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }

  if (reduceMotion) {
    document.body.classList.add("is-reduced-motion");
    reveals.forEach(function (el) {
      el.classList.add("is-in");
    });
    onScrollHeader();
    window.addEventListener("scroll", onScrollHeader, { passive: true });
    return;
  }

  /* ——— Lenis soft scroll: desktop only (draft-3d / mobile perf) ——— */
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
      lenis.on("scroll", onScrollHeader);
      document.documentElement.classList.add("lenis");
    } catch (e) {
      console.info("[Couchette animations] Lenis skipped", e);
      lenis = null;
    }
  }
  if (!lenis) {
    window.addEventListener("scroll", onScrollHeader, { passive: true });
  }
  onScrollHeader();

  /* ——— GSAP ——— */
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    /* Fallback: IntersectionObserver reveals + scroll progress without GSAP */
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
        { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
      );
      reveals.forEach(function (el) {
        io.observe(el);
      });
    } else {
      reveals.forEach(function (el) {
        el.classList.add("is-in");
      });
    }

    var track = document.getElementById("scroll-track");
    function crudeProgress() {
      if (!track || !window.COUCHETTE_TRAIN) return;
      var rect = track.getBoundingClientRect();
      var total = track.offsetHeight + window.innerHeight;
      var seen = window.innerHeight - rect.top;
      var p = Math.max(0, Math.min(1, seen / total));
      window.COUCHETTE_TRAIN.setProgress(p);
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

  /* Hero entrance */
  var heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
  var heroEls = document.querySelectorAll(".hero [data-reveal]");
  heroTl.fromTo(
    heroEls,
    { autoAlpha: 0, y: 36 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 1,
      stagger: 0.12,
      clearProps: "transform",
    },
    0.15
  );
  heroEls.forEach(function (el) {
    el.classList.add("is-in");
  });

  /* Section reveals */
  gsap.utils.toArray("[data-reveal]").forEach(function (el) {
    if (el.closest(".hero")) return;
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 40 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
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

  /* Editorial ideas stagger */
  var cards = gsap.utils.toArray(".idea");
  if (cards.length) {
    ScrollTrigger.batch(cards, {
      start: "top 90%",
      onEnter: function (batch) {
        gsap.to(batch, {
          autoAlpha: 1,
          y: 0,
          stagger: 0.12,
          duration: 0.8,
          ease: "power3.out",
          overwrite: true,
        });
      },
    });
  }

  /* Train scrub: continuous journey hero → end of scroll-track */
  var hero = document.getElementById("hero");
  var track = document.getElementById("scroll-track");
  var scrubAmt = isMobile ? 0.6 : 0.85;
  if (hero && track) {
    ScrollTrigger.create({
      trigger: hero,
      start: "top top",
      endTrigger: track,
      end: "bottom top",
      scrub: scrubAmt,
      onUpdate: function (self) {
        if (window.COUCHETTE_TRAIN && window.COUCHETTE_TRAIN.setProgress) {
          window.COUCHETTE_TRAIN.setProgress(self.progress);
        }
      },
    });
  } else if (track) {
    ScrollTrigger.create({
      trigger: track,
      start: "top bottom",
      end: "bottom top",
      scrub: scrubAmt,
      onUpdate: function (self) {
        if (window.COUCHETTE_TRAIN && window.COUCHETTE_TRAIN.setProgress) {
          window.COUCHETTE_TRAIN.setProgress(self.progress);
        }
      },
    });
  }

  /* Soft parallax on waitlist panel */
  var panel = document.querySelector(".waitlist-panel");
  if (panel) {
    gsap.fromTo(
      panel,
      { y: 40 },
      {
        y: 0,
        ease: "none",
        scrollTrigger: {
          trigger: panel,
          start: "top 95%",
          end: "top 55%",
          scrub: true,
        },
      }
    );
  }
})();

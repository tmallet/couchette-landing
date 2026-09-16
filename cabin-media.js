/**
 * Couchette — Option B cabin-glass editorial media
 * Poster + video loop inside .cabin-media; no WebGL / Quaternius / GLB.
 * Exposes window.COUCHETTE_TRAIN.setProgress for scroll scrub compat.
 * prefers-reduced-motion → pause video, poster still.
 */
(function () {
  "use strict";

  var REDUCED_MQ = "(prefers-reduced-motion: reduce)";
  var media = document.getElementById("cabin-media");
  var video = document.getElementById("cabin-video");
  var poster = document.getElementById("cabin-poster");
  var fallback = document.getElementById("scene-fallback");

  var targetProgress = 0;

  window.COUCHETTE_TRAIN = {
    progress: 0,
    setProgress: function (t) {
      targetProgress = Math.max(0, Math.min(1, Number(t) || 0));
      window.COUCHETTE_TRAIN.progress = targetProgress;
    },
    destroy: function () {
      if (video) {
        try {
          video.pause();
        } catch (e) {}
      }
    },
  };

  function prefersReduced() {
    return window.matchMedia && window.matchMedia(REDUCED_MQ).matches;
  }

  function showPosterOnly() {
    if (video) {
      try {
        video.pause();
      } catch (e) {}
      video.removeAttribute("autoplay");
      video.classList.add("is-hidden");
    }
    if (poster) {
      poster.classList.add("is-on");
      poster.removeAttribute("hidden");
    }
    if (media) media.classList.add("is-ready", "is-poster-only");
  }

  function showFallback() {
    showPosterOnly();
    if (fallback) fallback.classList.add("is-on");
    if (media) media.classList.add("is-error");
  }

  function markReady() {
    if (media) media.classList.add("is-ready");
    if (video) video.classList.add("is-ready");
  }

  function tryPlay() {
    if (!video || prefersReduced()) return;
    var p = video.play();
    if (p && typeof p.then === "function") {
      p.then(markReady).catch(function () {
        if (poster) poster.classList.add("is-on");
        markReady();
      });
    } else {
      markReady();
    }
  }

  if (!media) return;

  if (prefersReduced()) {
    document.body.classList.add("is-reduced-motion");
    showPosterOnly();
    return;
  }

  if (!video) {
    showPosterOnly();
    return;
  }

  video.addEventListener("loadeddata", markReady);
  video.addEventListener("canplay", markReady);
  video.addEventListener("error", showFallback);

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        var vis = entries.some(function (e) {
          return e.isIntersecting && e.intersectionRatio > 0.05;
        });
        if (vis) tryPlay();
        else {
          try {
            video.pause();
          } catch (e) {}
        }
      },
      { threshold: [0, 0.05, 0.25] }
    );
    io.observe(media);
  } else {
    tryPlay();
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      try {
        video.pause();
      } catch (e) {}
    } else if (!prefersReduced()) {
      tryPlay();
    }
  });

  if (video.readyState >= 2) markReady();
  tryPlay();
})();

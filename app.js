(function () {
  "use strict";

  var cfg = window.COUCHETTE_CONFIG || {};
  var STORAGE_KEY = "couchette_waitlist";

  var form = document.getElementById("waitlist-form");
  var formBlock = document.getElementById("waitlist-form-block");
  var confirmEl = document.getElementById("waitlist-confirm");
  var submitBtn = form && form.querySelector('[type="submit"]');
  var statusEl = document.getElementById("form-status");

  if (!form || !formBlock || !confirmEl) return;

  function payloadFromForm() {
    return {
      email: (form.email.value || "").trim(),
      country: form.country.value,
      intention: form.intention.value,
    };
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function setBusy(busy) {
    if (!submitBtn) return;
    submitBtn.disabled = busy;
    submitBtn.setAttribute("aria-busy", busy ? "true" : "false");
    submitBtn.textContent = busy ? "Envoi…" : "Rejoindre la waitlist";
  }

  function setStatus(msg, isError) {
    if (!statusEl) return;
    statusEl.textContent = msg || "";
    statusEl.hidden = !msg;
    statusEl.classList.toggle("is-error", !!isError);
  }

  function saveLocal(entry) {
    try {
      var list = [];
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) list = JSON.parse(raw) || [];
      if (!Array.isArray(list)) list = [];
      list.push(
        Object.assign({}, entry, { ts: new Date().toISOString() })
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (err) {
      /* private mode / quota — ignore */
    }
  }

  function showConfirm() {
    formBlock.classList.add("is-hidden");
    confirmEl.classList.add("is-visible");
    confirmEl.setAttribute("tabindex", "-1");
    try {
      confirmEl.focus();
    } catch (e) {}
  }

  function postToBackend(data) {
    var endpoint = cfg.FORM_ENDPOINT;
    if (!endpoint) {
      return Promise.reject(new Error("FORM_ENDPOINT manquant"));
    }

    var body = {
      email: data.email,
      country: data.country,
      intention: data.intention,
      _subject: cfg.FORM_SUBJECT || "Couchette waitlist",
      _template: "table",
      _captcha: "false",
      _honey: "",
    };

    return fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    }).then(function (res) {
      return res.json().then(
        function (json) {
          return { ok: res.ok, status: res.status, json: json };
        },
        function () {
          return { ok: res.ok, status: res.status, json: null };
        }
      );
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    setStatus("");

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    var data = payloadFromForm();
    if (!isValidEmail(data.email)) {
      setStatus("Indiquez une adresse email valide.", true);
      form.email.focus();
      return;
    }
    if (!data.country) {
      setStatus("Choisissez un pays.", true);
      form.country.focus();
      return;
    }
    if (!data.intention) {
      setStatus("Indiquez votre intention.", true);
      return;
    }

    setBusy(true);
    saveLocal(data);

    postToBackend(data)
      .then(function (result) {
        /* FormSubmit returns success after activation; first hit may ask to activate. */
        var msg =
          (result.json && (result.json.message || result.json.success)) || "";
        var activated =
          result.ok ||
          /success/i.test(String(msg)) ||
          /confirm|activat|check your email/i.test(String(msg));

        if (activated || result.status === 200) {
          showConfirm();
          return;
        }

        /* Still show confirm — localStorage has the row; backend may need activation. */
        showConfirm();
      })
      .catch(function () {
        /* Network / CORS / file:// — localStorage kept the capture for this browser. */
        showConfirm();
        setStatus(
          "Inscription enregistrée localement. Si c’est la 1ʳᵉ fois, activez FormSubmit via l’email reçu.",
          false
        );
      })
      .finally(function () {
        setBusy(false);
      });
  });
})();

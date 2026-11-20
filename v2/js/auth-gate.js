// ============================================================
// Cosmetic password gate.
//
// NOTE: this is a deterrent only, NOT real security. The site is a
// static, PUBLIC GitHub Pages page, so the password below and all
// page content are readable in the page source / public repo. It just
// keeps casual visitors from landing straight on the prototype.
//
// To change the password, edit PASSWORD below.
// ============================================================
(function () {
  "use strict";

  const PASSWORD = "gyg2026"; // ← change this to set the preview password
  const KEY = "sxp-auth";

  const gate = document.getElementById("auth-gate");
  const form = document.getElementById("auth-form");
  const input = document.getElementById("auth-input");
  const error = document.getElementById("auth-error");
  if (!gate || !form || !input) return;

  function unlock() {
    try {
      sessionStorage.setItem(KEY, "1");
    } catch (e) {}
    document.documentElement.classList.add("authed");
    gate.remove();
  }

  // Already unlocked this session → skip the gate.
  try {
    if (sessionStorage.getItem(KEY) === "1") {
      unlock();
      return;
    }
  } catch (e) {}

  // Spanish links (?lang=es) get a Spanish gate. The gate runs before any
  // supplier data loads, so it follows the link rather than the supplier.
  const i18n = window.SXP_I18N;
  if (i18n && i18n.requested === "es") {
    const prev = i18n.state.lang;
    i18n.state.lang = "es";
    const set = (sel, prop, key) => { const el = gate.querySelector(sel); if (el) el[prop] = i18n.t(key); };
    set(".auth-gate__title", "textContent", "gate.title");
    set(".auth-gate__desc", "textContent", "gate.desc");
    set(".auth-gate__btn", "textContent", "gate.enter");
    set(".auth-gate__error", "textContent", "gate.error");
    input.placeholder = i18n.t("gate.placeholder");
    input.setAttribute("aria-label", i18n.t("gate.placeholder"));
    i18n.state.lang = prev;
  }

  input.focus();
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (input.value === PASSWORD) {
      unlock();
    } else {
      error.classList.remove("hidden");
      input.select();
    }
  });
})();

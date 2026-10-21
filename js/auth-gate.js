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

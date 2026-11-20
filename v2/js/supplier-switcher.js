// ============================================================
// SUPPLIER SWITCHER — round 2
//
// Round 1 switched ACTIVITIES; round 2 switches SUPPLIERS. The overview lists
// every activity a supplier has, so the activity is chosen by clicking through
// that table, not from this menu. (Settled 2026-11-19.)
//
// Hash formats:
//   index.html#<supplierKey>
//   activity.html#<supplierKey>/<tourId>
//
// `?supplier` locks the chip to a plain label: no dropdown, no chevron, and
// the menu is removed from the DOM rather than hidden, so a supplier watching
// the network tab is not shown every other company's name. Only the file the
// hash names is fetched.
//
// This is a DEMO AFFORDANCE, NOT ACCESS CONTROL. Every file stays readable at
// data/*.json and dropping the query param brings the switcher back. Note
// data/suppliers.json is still fetched in that mode and names all five
// suppliers — closing that needs a per-supplier manifest or a build step,
// which GitHub Pages cannot do by hash.
// ============================================================
(function (global) {
  "use strict";

  const LOCKED = new URLSearchParams(location.search).has("supplier");

  function parseHash() {
    const raw = decodeURIComponent(location.hash.replace(/^#/, ""));
    const [key, tour] = raw.split("/");
    return { key: key || null, tourId: tour ? Number(tour) : null };
  }

  async function init(opts) {
    const root = document.getElementById("supplier-switcher");
    const label = document.getElementById("switcher-label");
    const sub = document.getElementById("switcher-sublabel");
    const menu = document.getElementById("switcher-menu");

    let index;
    try {
      index = await fetch("data/suppliers.json", { cache: "no-store" }).then((r) => r.json());
    } catch (err) {
      return opts.onError && opts.onError(err, { file: "data/suppliers.json" });
    }
    const suppliers = index.suppliers || [];
    if (!suppliers.length) return;

    let { key, tourId } = parseHash();
    let entry = suppliers.find((s) => s.id === key) || suppliers[0];

    async function load() {
      let file;
      try {
        file = await fetch("data/" + entry.file, { cache: "no-store" }).then((r) => r.json());
      } catch (err) {
        return opts.onError && opts.onError(err, entry);
      }
      if (label) label.textContent = file.supplier_name;
      if (sub && !LOCKED) {
        sub.textContent = entry.activities + (entry.activities === 1 ? " activity" : " activities");
      }
      opts.onSelect(file, entry, tourId);
    }

    if (LOCKED) {
      if (root) {
        root.removeAttribute("role");
        root.removeAttribute("tabindex");
        root.removeAttribute("aria-haspopup");
        root.removeAttribute("aria-expanded");
        root.classList.add("is-locked");
        const chev = root.querySelector(".topnav__chevron");
        if (chev) chev.remove();
      }
      if (menu) menu.remove();
      if (sub) sub.textContent = "";
    } else if (menu && root) {
      // Labels name the supplier and how many activities it has — nothing
      // evaluative. These are real companies and the view is supplier-facing.
      menu.innerHTML = suppliers
        .map(
          (s) =>
            '<li role="option" data-id="' + s.id + '" tabindex="0"' +
            (s.id === entry.id ? ' aria-selected="true" class="is-selected"' : "") +
            "><span>" + s.supplierName + "</span><span class=\"switcher-menu__meta\">" +
            s.activities + (s.activities === 1 ? " activity" : " activities") + "</span></li>"
        )
        .join("");
      const close = () => {
        menu.hidden = true;
        root.setAttribute("aria-expanded", "false");
      };
      root.addEventListener("click", (e) => {
        if (e.target.closest("#switcher-menu")) return;
        const open = menu.hidden;
        menu.hidden = !open;
        root.setAttribute("aria-expanded", String(open));
      });
      menu.addEventListener("click", (e) => {
        const li = e.target.closest("li[data-id]");
        if (!li) return;
        entry = suppliers.find((s) => s.id === li.dataset.id) || entry;
        tourId = null;
        location.hash = entry.id;
        menu.querySelectorAll("li").forEach((n) => {
          n.classList.toggle("is-selected", n === li);
          n.setAttribute("aria-selected", String(n === li));
        });
        close();
        load();
      });
      document.addEventListener("click", (e) => {
        if (!root.contains(e.target)) close();
      });
    }

    window.addEventListener("hashchange", () => {
      const next = parseHash();
      const found = suppliers.find((s) => s.id === next.key);
      if (found) entry = found;
      tourId = next.tourId;
      load();
    });

    if (!location.hash) location.hash = entry.id;
    load();
  }

  global.SupplierSwitcher = { init, parseHash, LOCKED };
})(window);

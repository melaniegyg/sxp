// ============================================================
// ACTIVITY SWITCHER
//
// Drives the top-right dropdown. Reads data/activities.json, lists the
// fixtures, and hands the selected one back:
//
//   ActivitySwitcher.init({ onSelect(activity, entry) { ... } });
//
// The selection is kept in the URL hash (#rating-miss) so a particular
// state can be linked to or reloaded into.
// ============================================================
(function (global) {
  "use strict";

  const MANIFEST = "data/activities.json";

  const esc = (s) =>
    String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // The sxp_activity_criteria export carries supplier_id but no supplier name,
  // so fixtures can add `supplier_name` (and optionally `supplier_company`).
  // Without one we show the id rather than invent a company.
  const supplierName = (a) =>
    a.supplier_name || a.supplier_company || "Supplier " + a.supplier_id;

  function init(opts) {
    const root = document.getElementById("activity-switcher");
    const menu = document.getElementById("switcher-menu");
    const label = document.getElementById("switcher-label");
    const sublabel = document.getElementById("switcher-sublabel");
    if (!root || !menu) return;

    // Supplier-facing links carry ?supplier, which turns the chip into a plain
    // label: no dropdown, no chevron, and only the fixture named in the hash is
    // fetched. That last part is the point — normally every fixture is loaded
    // up front to label the menu, so without this a supplier sees seventeen
    // other companies' files go past in the network tab.
    //
    // This is a demo affordance, NOT access control. Every fixture stays
    // readable at data/*.json and dropping the query param brings the switcher
    // back. It stops the other suppliers being handed over; it does not stop
    // them being found.
    const locked = new URLSearchParams(location.search).has("supplier");

    let entries = [];

    function close() {
      if (locked) return;
      menu.hidden = true;
      root.setAttribute("aria-expanded", "false");
    }
    function open() {
      menu.hidden = false;
      root.setAttribute("aria-expanded", "true");
    }

    function select(entry, pushHash) {
      // Primary line is the supplier; the scenario sits underneath so fixtures
      // for the same supplier stay tellable apart.
      label.textContent = entry.supplier;
      // The scenario line is an internal label ("Misses rating"), so it is
      // dropped for suppliers — they see their company name and nothing that
      // reads as a verdict on it from the page furniture.
      sublabel.textContent = locked ? "" : entry.label;
      menu.querySelectorAll("li").forEach((li) =>
        li.setAttribute("aria-selected", String(li.dataset.id === entry.id))
      );
      if (pushHash) history.replaceState(null, "", "#" + entry.id);
      close();
      opts.onSelect(entry.activity, entry);
    }

    return fetch(MANIFEST + "?cb=" + Date.now())
      .then((r) => r.json())
      .then((m) => {
        const all = m.activities || [];
        // Unlocked, every fixture is loaded up front so the menu can label each
        // one from its own data rather than from hand-written manifest strings.
        // Locked, only the one the hash names is fetched. An unknown or missing
        // hash falls back to the first entry so the page still renders.
        const wanted = locked
          ? all.filter((e) => e.id === location.hash.slice(1)).slice(0, 1)
          : all;
        return (wanted.length ? wanted : all.slice(0, 1)).map((e) => e);
      })
      .then((list) =>
        Promise.all(
          list.map((e) =>
            fetch("data/" + e.file + "?cb=" + Date.now())
              .then((r) => {
                if (!r.ok) throw new Error(r.status + " fetching " + e.file);
                return r.json();
              })
              .then((activity) => ({ ...e, activity, supplier: supplierName(activity) }))
              .catch((err) => {
                if (opts.onError) opts.onError(err, e);
                return null;
              })
          )
        )
      )
      .then((loaded) => {
        entries = loaded.filter(Boolean);
        if (!entries.length) return;

        // Locked: strip the chip's interactive affordances and drop the menu
        // from the DOM entirely rather than hiding it, so there is no list of
        // other suppliers to find in the markup.
        if (locked) {
          ["role", "tabindex", "aria-haspopup", "aria-expanded", "aria-label"].forEach((a) =>
            root.removeAttribute(a)
          );
          root.classList.add("topnav__user--locked");
          menu.remove();
          select(entries[0], false);
          return;
        }

        menu.innerHTML = entries
          .map(
            (e) => `
          <li class="switcher-menu__item" role="option" data-id="${esc(e.id)}" aria-selected="false" tabindex="0">
            <span class="switcher-menu__label">${esc(e.supplier)}</span>
            <span class="switcher-menu__sub">${esc(e.label)}</span>
          </li>`
          )
          .join("");

        menu.querySelectorAll("li").forEach((li) => {
          const entry = entries.find((e) => e.id === li.dataset.id);
          const pick = (ev) => {
            ev.stopPropagation();
            select(entry, true);
          };
          li.addEventListener("click", pick);
          li.addEventListener("keydown", (ev) => {
            if (ev.key === "Enter" || ev.key === " ") pick(ev);
          });
        });

        root.addEventListener("click", () => (menu.hidden ? open() : close()));
        root.addEventListener("keydown", (ev) => {
          if (ev.key === "Enter" || ev.key === " ") {
            ev.preventDefault();
            menu.hidden ? open() : close();
          } else if (ev.key === "Escape") close();
        });
        document.addEventListener("click", (ev) => {
          if (!root.contains(ev.target)) close();
        });

        const fromHash = entries.find((e) => e.id === location.hash.slice(1));
        select(fromHash || entries[0], false);
      });
  }

  global.ActivitySwitcher = { init };
})(window);

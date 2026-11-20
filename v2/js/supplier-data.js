// ============================================================
// SUPPLIER DATA + HASH ROUTING — round 2
//
// Was js/supplier-switcher.js, which fetched data AND drew a menu with
// hand-written DOM. The drawing is now a Vue component (SupplierSwitcher in
// js/components.js) over PrimeVue's Menu; what is left here is the part that
// was never about the UI: loading fixtures and reading the URL hash.
//
// Hash formats:
//   index.html#<supplierKey>
//   activity.html#<supplierKey>/<tourId>
//
// `?supplier` locks the chip to a plain label and fetches ONLY the file the
// hash names, so a supplier watching the network tab is not shown every other
// company's data.
//
// This is a DEMO AFFORDANCE, NOT ACCESS CONTROL. Every file stays readable at
// data/*.json and dropping the query param brings the switcher back.
// data/suppliers.json is still fetched in that mode and names all five
// suppliers — closing that needs a per-supplier manifest or a build step,
// which GitHub Pages cannot do by hash.
// ============================================================

export const LOCKED = new URLSearchParams(location.search).has("supplier");

// Every link between the two pages must carry the lock, or one click on
// "View details" or "Back" drops `?supplier` and the switcher reappears with
// every other company in it. Build internal hrefs through this, never by hand.
export const pageHref = (page, hash) => page + (LOCKED ? "?supplier" : "") + "#" + hash;

export function parseHash() {
  const raw = decodeURIComponent(location.hash.replace(/^#/, ""));
  const [key, tour] = raw.split("/");
  return { key: key || null, tourId: tour ? Number(tour) : null };
}

const getJson = (url) => fetch(url, { cache: "no-store" }).then((r) => r.json());

export const loadIndex = () =>
  getJson("data/suppliers.json").then((i) => i.suppliers || []);

export const loadSupplier = (entry) => getJson("data/" + entry.file);

export const activityCount = (n) => n + (n === 1 ? " activity" : " activities");

// Picks the entry the hash names, falling back to the first so a bare
// `?supplier` link shows something rather than breaking.
export function resolveEntry(suppliers, key) {
  return suppliers.find((s) => s.id === key) || suppliers[0] || null;
}

// ---------------------------------------------------------------
// Shared loading state
// ---------------------------------------------------------------
// Both pages need the same five things — the supplier index, the selected
// entry, that supplier's fixture, the tour id from the hash, and a reload on
// hashchange. Each page had its own copy of that script block; this is the one
// copy. `onFile` is where the pages differ: the overview builds a supplier
// model from the file, the activity page picks one activity out of it.
export function createSupplierState(reactive, onFile) {
  const state = reactive({
    suppliers: [], entry: null, file: null, supplierName: "", tourId: null, error: "",
  });

  async function load() {
    try {
      state.file = await loadSupplier(state.entry);
    } catch (err) {
      state.error = "Could not load " + state.entry.file + ": " + err.message;
      return;
    }
    state.supplierName = state.file.supplier_name;
    onFile(state.file, state.entry, state.tourId);
  }

  function select(supplier) {
    state.entry = supplier;
    state.tourId = null;
    location.hash = supplier.id; // hashchange does the reload
  }

  async function init() {
    try {
      state.suppliers = await loadIndex();
    } catch (err) {
      state.error = "Could not load data/suppliers.json: " + err.message;
      return;
    }
    if (!state.suppliers.length) return;

    const { key, tourId } = parseHash();
    state.entry = resolveEntry(state.suppliers, key);
    state.tourId = tourId;

    window.addEventListener("hashchange", () => {
      const next = parseHash();
      const found = resolveEntry(state.suppliers, next.key);
      if (found) state.entry = found;
      state.tourId = next.tourId;
      load();
    });

    // Writing the hash fires hashchange, which loads. Calling load() as well
    // would fetch the fixture twice on any link without one — which is every
    // bare `?supplier` link.
    if (location.hash) load();
    else location.hash = state.entry.id;
  }

  return { state, init, select };
}

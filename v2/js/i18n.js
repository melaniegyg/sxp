// ============================================================
// SXP ROUND 2 — every supplier-facing string, in English and Spanish
//
// Added 2026-11-20 so Taller Andaluz de Cocina can see the whole experience
// in Spanish. The Spanish is a DRAFT written by Claude for the prototype, not
// approved localisation copy — a reviewer should only ever need to edit this
// file (plus data/defect-catalogue.es.json for the complaint cards).
//
// Conventions in the Spanish:
//   - Peninsular Spanish (the supplier is in Seville), informal "tú".
//   - "Excellent Experience" stays in English: it is the badge's brand name.
//   - Activity titles are NOT translated (Melanie, 2026-11-20). They come
//     from the data, not from here.
//
// Classic script, loaded after Vue and before criteria-model.js, so both the
// model (a classic script) and the Vue templates (via the global `t`) read it.
//
// Language: `?lang=es` asks for Spanish; supplier-data.js grants it only if
// the supplier's entry in data/suppliers.json lists "es" in `languages`.
// ============================================================
(function (global) {
  "use strict";

  const STRINGS = {
    en: {
      // --- Shell -------------------------------------------------
      "nav.home": "Home",
      "nav.create": "Create",
      "nav.manage": "Manage",
      "nav.bookings": "Bookings",
      "nav.performance": "Performance",
      "nav.overview": "Overview",
      "nav.excellence": "Excellence program",
      "nav.reviews": "Reviews",
      "nav.finance": "Finance",
      "nav.collapse": "Collapse",
      "nav.collapseMenu": "Collapse menu",
      "nav.expandMenu": "Expand menu",
      "help": "Help",
      "switcher.aria": "Switch supplier",
      "lang.aria": "Language",
      "lang.en": "English",
      "lang.es": "Español",
      "activities.one": "{n} activity",
      "activities.many": "{n} activities",

      // --- Shared ------------------------------------------------
      "months.this": "This month",
      "months.next": "Next month",
      "period.checked": "Period checked: {range}",
      "list.and": " and ",
      "doc.title": "{name} — Excellence program",

      // --- Overview ----------------------------------------------
      "ov.badge": "Excellence",
      "ov.title": "Excellence program",
      "ov.lede":
        "The Excellent Experience badge celebrates the best activities on our marketplace where the activity provider has consistently delivered a professional, high-standard experience for our customers.",
      "ov.crit.title": "Program criteria",
      "ov.crit.sub": "Calculated every month based on the last 6 months",
      "ov.learnMore": "Learn more",
      "ov.crit.reviews.d": "At least 50 new reviews in this period",
      "ov.crit.operational.d": "24-hour cancellation and no safety issues",
      "ov.crit.quality.d": "High customer rating and few complaints",
      "ov.badgeStatus": "Badge status",
      "ov.filter.status": "Filter by badge status",
      "ov.filter.statusPh": "Select status",
      "ov.filter.product": "Filter by product",
      "ov.filter.productPh": "All products",
      "ov.col.product": "Product",
      "ov.col.status": "Badge status",
      "ov.col.reason": "Reason",
      "ov.viewDetails": "View details",
      "ov.empty": "No activities match these filters.",
      "ov.notInProgram": "Not in the program",
      "ov.reasonAria": "Why is this activity not in the program?",
      "ineligible.reason": "Only guided tours and experiences are eligible for the program at this time",
      "ineligible.tip": "Think this activity should qualify? Contact Customer Care and we’ll check it for you",
      "exclusion.headline":
        "Due to review manipulation, your activities are not eligible for the program until {date}",
      "exclusion.body":
        "Your supplier account has been flagged due to evidence you have engaged in behavior that goes against our review policy. Reviews must reflect the experience of genuine customers and must not be influenced or manipulated in any way. As a result, your activities are excluded from the program for now.",

      // --- Chips -------------------------------------------------
      "chip.excellence": "Excellence",
      "chip.reviews": "Reviews not met",
      "chip.operations": "Operations not met",
      "chip.quality": "Quality not met",

      // --- Activity page -----------------------------------------
      "act.back": "Back",
      "act.tab.overview": "Performance overview",
      "act.tab.excellence": "Excellence program",
      "act.tab.competitor": "Competitor report",
      "act.status": "Excellence program status",

      // --- Promo (This month) ------------------------------------
      "promo.title": "Get rewarded for your excellence!",
      "promo.desc":
        "Your activity is being evaluated on the last 6 months of performance data (Jul 1 – Dec 31). Badges are awarded Jan 1, then reassessed every month after that.",
      "promo.cta": "Check your status",
      "promo.months": "JUL,AUG,SEP,OCT,NOV,DEC",
      "promo.today": "{m} 1",
      "promo.awardDate": "JAN 1",
      "promo.awarded": "Badges awarded",
      "promo.evaluated": "What your activity will be evaluated on",
      "promo.crit.reviews": "At least 50 reviews",
      "promo.crit.operational": "24-hour cancellation policy & trust and safety check",
      "promo.crit.quality": "Rating and complaint rate",
      "promo.tracking": "Tracking since Jul 1",
      "promo.benefits": "Benefits",
      "promo.b1.t": "Get booked with confidence",
      "promo.b1.d": "The badge puts your commitment to quality front and center for travelers",
      "promo.b2.t": "Be seen by more customers",
      "promo.b2.d": "Show up higher in search results and get featured in more emails to travelers",
      "promo.b3.t": "Become the easy choice",
      "promo.b3.d": "When listings look alike, this badge is what sets you apart from competitors",

      // --- Sections and rows -------------------------------------
      "sec.review-count": "Review count",
      "sec.operational": "Operational standards",
      "sec.quality": "Quality standards",
      "row.reviews.label": "{n} reviews from this period",
      "row.reviews.desc": "This minimum gives us enough evidence to understand the quality of your activity",
      "row.reviews.cta": "Collect more reviews",
      "row.reviews.reason": "too few reviews",
      "row.cancel.label": "{h}-hour cancellation policy",
      "row.cancel.desc": "Our standard policy ensures the most flexibility for travelers.",
      "row.cancel.fail":
        "Contact your Account Manager or customer care in order to adjust the cancellation policy on your activity to 24 hours.",
      "row.cancel.cta": "Contact us",
      "row.cancel.reason": "its cancellation policy",
      "row.ts.label": "Trust and safety check",
      "row.ts.desc": "We track complaints and reviews related to serious issues across all your activities.",
      "row.ts.failManipulation":
        "This activity is not eligible for the badge because your account has been flagged for review manipulation. Search for messages from {email} in your emails to find more details.",
      "row.ts.failSevere":
        "This activity is not eligible for the badge because it has a severe trust and safety case confirmed in the last 6 months.",
      "row.ts.failSevereUntil":
        "This activity is not eligible for the badge because it has a severe trust and safety case confirmed in the last 6 months. From {date} it will be eligible again.",
      "row.ts.reason": "a trust and safety issue",
      "row.rating.label": "Rating",
      "row.rating.desc":
        "The average star rating from customer reviews for this activity in this period must be {bar} or higher",
      "row.rating.reason": "its rating",
      "row.complaints.label": "Complaints",
      "row.complaints.desc":
        "The percentage of bookings with at least one general complaint flagged in a review or customer care contact must be {bar} or lower",
      "row.complaints.reason": "complaints",
      "row.complaints.top": "Top complaints for this activity",
      "row.pickup.label": "Pickup issues",
      "row.pickup.desc":
        "The percentage of bookings with at least one pickup issue flagged in a review or customer care contact must be {bar} or lower",
      "row.pickup.reason": "pickup issues",
      "row.pickup.top": "Top pickup problems for this activity",
      "row.blocked": "We can only show this activity’s quality metrics once there are {n} new reviews",
      "row.criteria": "Criteria:",
      "row.seeDetails": "See details",
      "row.hideDetails": "Hide details",
      "row.reviewSummary": "Review summary",

      // --- Complaint cards (chrome; card copy is in the catalogue) -
      "dc.mostCommon": "Most common complaint",
      "dc.whatYouCanDo": "What you can do",
      "dc.resources": "Resources",
      "dc.takeAction": "Take action",
      "dc.recent": "recent",

      // --- Banners -----------------------------------------------
      "banner.earned.headline": "Nice work! This activity will receive an Excellent Experience badge in {month}",
      "banner.earned.body": "As long as you continue to meet all the criteria below, the badge will be awarded on",
      "banner.excluded.headline": "This activity does not meet the operational standards to be eligible for the program",
      "banner.excluded.body":
        "This activity is not eligible for the badge because your supplier account has been flagged for review manipulation.",
      "banner.reviews.headline": "This activity does not have enough reviews to be eligible for the program",
      "banner.reviews.body": "This activity is not eligible for the badge because it doesn’t have {n} reviews in last 6 months.",
      "banner.fail.headline.review-count": "This activity does not meet the review count to be awarded the badge",
      "banner.fail.headline.operational": "This activity does not meet the operational standards to be awarded the badge",
      "banner.fail.headline.quality": "This activity does not meet the quality standards to be awarded the badge",
      "banner.fail.body.one":
        "This activity doesn't meet the criteria due to {reasons}. See that section below to find out how to improve.",
      "banner.fail.body.many":
        "This activity doesn't meet the criteria due to {reasons}. See those sections below to find out how to improve.",
      "banner.tsExclusion": " This is a Trust & Safety exclusion and applies across your activities.",

      // --- Password gate -----------------------------------------
      "gate.title": "Protected preview",
      "gate.desc": "Enter the password to view this prototype.",
      "gate.placeholder": "Password",
      "gate.enter": "Enter",
      "gate.error": "Incorrect password. Try again.",

      // --- PrimeVue's own labels ---------------------------------
      "pv.empty": "No available options",
      "pv.emptyFilter": "No results found",
    },

    es: {
      "nav.home": "Inicio",
      "nav.create": "Crear",
      "nav.manage": "Gestionar",
      "nav.bookings": "Reservas",
      "nav.performance": "Rendimiento",
      "nav.overview": "Resumen",
      "nav.excellence": "Programa de excelencia",
      "nav.reviews": "Reseñas",
      "nav.finance": "Finanzas",
      "nav.collapse": "Contraer",
      "nav.collapseMenu": "Contraer menú",
      "nav.expandMenu": "Expandir menú",
      "help": "Ayuda",
      "switcher.aria": "Cambiar de proveedor",
      "lang.aria": "Idioma",
      "lang.en": "English",
      "lang.es": "Español",
      "activities.one": "{n} actividad",
      "activities.many": "{n} actividades",

      "months.this": "Este mes",
      "months.next": "Próximo mes",
      "period.checked": "Periodo revisado: {range}",
      "list.and": " y ",
      "doc.title": "{name} — Programa de excelencia",

      "ov.badge": "Excelencia",
      "ov.title": "Programa de excelencia",
      "ov.lede":
        "La insignia Excellent Experience reconoce las mejores actividades de nuestro marketplace: aquellas en las que el proveedor ha ofrecido de forma constante una experiencia profesional y de gran calidad a nuestros clientes.",
      "ov.crit.title": "Criterios del programa",
      "ov.crit.sub": "Se calculan cada mes a partir de los últimos 6 meses",
      "ov.learnMore": "Más información",
      "ov.crit.reviews.d": "Al menos 50 reseñas nuevas en este periodo",
      "ov.crit.operational.d": "Cancelación con 24 horas de antelación y sin incidentes de seguridad",
      "ov.crit.quality.d": "Valoración alta de los clientes y pocas quejas",
      "ov.badgeStatus": "Estado de la insignia",
      "ov.filter.status": "Filtrar por estado",
      "ov.filter.statusPh": "Selecciona un estado",
      "ov.filter.product": "Filtrar por producto",
      "ov.filter.productPh": "Todos los productos",
      "ov.col.product": "Producto",
      "ov.col.status": "Estado de la insignia",
      "ov.col.reason": "Motivo",
      "ov.viewDetails": "Ver detalles",
      "ov.empty": "Ninguna actividad coincide con estos filtros.",
      "ov.notInProgram": "Fuera del programa",
      "ov.reasonAria": "¿Por qué esta actividad no está en el programa?",
      "ineligible.reason": "Por ahora, solo los tours guiados y las experiencias pueden participar en el programa",
      "ineligible.tip": "¿Crees que esta actividad debería participar? Contacta con atención al cliente y lo revisaremos",
      "exclusion.headline":
        "Debido a la manipulación de reseñas, tus actividades no pueden participar en el programa hasta el {date}",
      "exclusion.body":
        "Tu cuenta de proveedor ha sido marcada porque hay indicios de que has incurrido en conductas contrarias a nuestra política de reseñas. Las reseñas deben reflejar la experiencia de clientes reales y no pueden estar influidas ni manipuladas de ninguna manera. Por este motivo, tus actividades quedan excluidas del programa por ahora.",

      "chip.excellence": "Excelencia",
      "chip.reviews": "Reseñas: no cumple",
      "chip.operations": "Operaciones: no cumple",
      "chip.quality": "Calidad: no cumple",

      "act.back": "Volver",
      "act.tab.overview": "Resumen de rendimiento",
      "act.tab.excellence": "Programa de excelencia",
      "act.tab.competitor": "Informe de la competencia",
      "act.status": "Estado en el programa de excelencia",

      "promo.title": "¡Tu excelencia tiene recompensa!",
      "promo.desc":
        "Tu actividad se está evaluando con los datos de rendimiento de los últimos 6 meses (1 jul – 31 dic). Las insignias se otorgan el 1 de enero y, a partir de entonces, se revisan cada mes.",
      "promo.cta": "Consulta tu estado",
      "promo.months": "JUL,AGO,SEP,OCT,NOV,DIC",
      "promo.today": "1 {m}",
      "promo.awardDate": "1 ENE",
      "promo.awarded": "Entrega de insignias",
      "promo.evaluated": "En qué se evaluará tu actividad",
      "promo.crit.reviews": "Al menos 50 reseñas",
      "promo.crit.operational": "Política de cancelación de 24 horas y control de confianza y seguridad",
      "promo.crit.quality": "Valoración y tasa de quejas",
      "promo.tracking": "En seguimiento desde el 1 jul",
      "promo.benefits": "Ventajas",
      "promo.b1.t": "Consigue reservas con confianza",
      "promo.b1.d": "La insignia pone tu compromiso con la calidad en primer plano para los viajeros",
      "promo.b2.t": "Llega a más clientes",
      "promo.b2.d": "Aparece más arriba en los resultados de búsqueda y en más correos electrónicos a viajeros",
      "promo.b3.t": "Conviértete en la opción evidente",
      "promo.b3.d": "Cuando los anuncios se parecen, esta insignia te distingue de la competencia",

      "sec.review-count": "Número de reseñas",
      "sec.operational": "Estándares operativos",
      "sec.quality": "Estándares de calidad",
      "row.reviews.label": "{n} reseñas en este periodo",
      "row.reviews.desc": "Este mínimo nos da información suficiente para valorar la calidad de tu actividad",
      "row.reviews.cta": "Conseguir más reseñas",
      "row.reviews.reason": "que tiene pocas reseñas",
      "row.cancel.label": "Política de cancelación de {h} horas",
      "row.cancel.desc": "Nuestra política estándar ofrece la máxima flexibilidad a los viajeros.",
      "row.cancel.fail":
        "Contacta con tu gestor de cuenta o con atención al cliente para cambiar la política de cancelación de tu actividad a 24 horas.",
      "row.cancel.cta": "Contáctanos",
      "row.cancel.reason": "su política de cancelación",
      "row.ts.label": "Control de confianza y seguridad",
      "row.ts.desc":
        "Hacemos un seguimiento de las quejas y reseñas relacionadas con incidentes graves en todas tus actividades.",
      "row.ts.failManipulation":
        "Esta actividad no puede optar a la insignia porque tu cuenta ha sido marcada por manipulación de reseñas. Busca en tu correo los mensajes de {email} para obtener más información.",
      "row.ts.failSevere":
        "Esta actividad no puede optar a la insignia porque tiene un caso grave de confianza y seguridad confirmado en los últimos 6 meses.",
      "row.ts.failSevereUntil":
        "Esta actividad no puede optar a la insignia porque tiene un caso grave de confianza y seguridad confirmado en los últimos 6 meses. A partir del {date} podrá volver a optar.",
      "row.ts.reason": "un problema de confianza y seguridad",
      "row.rating.label": "Valoración",
      "row.rating.desc":
        "La valoración media de las reseñas de los clientes para esta actividad en este periodo debe ser de {bar} o superior",
      "row.rating.reason": "su valoración",
      "row.complaints.label": "Quejas",
      "row.complaints.desc":
        "El porcentaje de reservas con al menos una queja general registrada en una reseña o en un contacto con atención al cliente debe ser del {bar} o inferior",
      "row.complaints.reason": "las quejas",
      "row.complaints.top": "Principales quejas sobre esta actividad",
      "row.pickup.label": "Problemas de recogida",
      "row.pickup.desc":
        "El porcentaje de reservas con al menos un problema de recogida registrado en una reseña o en un contacto con atención al cliente debe ser del {bar} o inferior",
      "row.pickup.reason": "los problemas de recogida",
      "row.pickup.top": "Principales problemas de recogida en esta actividad",
      "row.blocked": "Solo podemos mostrar las métricas de calidad de esta actividad cuando tenga {n} reseñas nuevas",
      "row.criteria": "Criterios:",
      "row.seeDetails": "Ver detalles",
      "row.hideDetails": "Ocultar detalles",
      "row.reviewSummary": "Resumen de reseñas",

      "dc.mostCommon": "Queja más frecuente",
      "dc.whatYouCanDo": "Qué puedes hacer",
      "dc.resources": "Recursos (en inglés)",
      "dc.takeAction": "Tomar medidas",
      "dc.recent": "recientes",

      "banner.earned.headline": "¡Buen trabajo! Esta actividad recibirá la insignia Excellent Experience en {month}",
      "banner.earned.body": "Siempre que sigas cumpliendo todos los criterios que aparecen a continuación, la insignia se otorgará el",
      "banner.excluded.headline": "Esta actividad no cumple los estándares operativos para participar en el programa",
      "banner.excluded.body":
        "Esta actividad no puede optar a la insignia porque tu cuenta de proveedor ha sido marcada por manipulación de reseñas.",
      "banner.reviews.headline": "Esta actividad no tiene suficientes reseñas para participar en el programa",
      "banner.reviews.body": "Esta actividad no puede optar a la insignia porque no tiene {n} reseñas en los últimos 6 meses.",
      "banner.fail.headline.review-count": "Esta actividad no alcanza el número de reseñas necesario para recibir la insignia",
      "banner.fail.headline.operational": "Esta actividad no cumple los estándares operativos para recibir la insignia",
      "banner.fail.headline.quality": "Esta actividad no cumple los estándares de calidad para recibir la insignia",
      "banner.fail.body.one":
        "Esta actividad no cumple los criterios debido a {reasons}. Consulta esa sección más abajo para saber cómo mejorar.",
      "banner.fail.body.many":
        "Esta actividad no cumple los criterios debido a {reasons}. Consulta esas secciones más abajo para saber cómo mejorar.",
      "banner.tsExclusion": " Se trata de una exclusión de confianza y seguridad y afecta a todas tus actividades.",

      "gate.title": "Vista previa protegida",
      "gate.desc": "Introduce la contraseña para ver este prototipo.",
      "gate.placeholder": "Contraseña",
      "gate.enter": "Entrar",
      "gate.error": "Contraseña incorrecta. Inténtalo de nuevo.",

      "pv.empty": "No hay opciones disponibles",
      "pv.emptyFilter": "No se han encontrado resultados",
    },
  };

  const requested = new URLSearchParams(location.search).get("lang") === "es" ? "es" : "en";

  // Reactive, so Vue templates re-render when the toggle flips. Starts on the
  // requested language to avoid an English flash; supplier-data.js drops it
  // back to English if the supplier has no Spanish.
  const state = global.Vue.reactive({ lang: requested });

  function t(key, vars) {
    const table = STRINGS[state.lang] || STRINGS.en;
    let s = table[key];
    if (s == null) s = STRINGS.en[key];
    if (s == null) {
      console.warn("[sxp] missing string " + key);
      return key;
    }
    if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
    return s;
  }

  const locale = () => (state.lang === "es" ? "es-ES" : "en-US");

  // Numbers and percentages: "2.2%" in English, "2,2 %" in Spanish.
  function num(n, minDigits, maxDigits) {
    return new Intl.NumberFormat(locale(), {
      minimumFractionDigits: minDigits,
      maximumFractionDigits: maxDigits,
    }).format(n);
  }
  const pctSuffix = () => (state.lang === "es" ? " %" : "%");

  function setLang(lang) {
    state.lang = lang === "es" ? "es" : "en";
    document.documentElement.lang = state.lang;
  }
  setLang(requested);

  global.SXP_I18N = { state, requested, t, locale, num, pctSuffix, setLang, STRINGS };
})(window);

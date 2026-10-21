// Card data for the defect-cards module.
// PLACEHOLDER — replace with this project's real data (same shape).
// See css/defect-cards.css + js/defect-cards.js. Field reference lives in the
// dbr-portal defect-cards/README.md.
window.CARDS_DATA = [
  {
    category: "Activity not as advertised",
    defects: [
      {
        name: "Activity not as described",
        description: "The activity delivered did not match the description.",
        recAction: "Booking defect - Not as advertised",
        recommendations: [
          "Review the description of your activity and provide all necessary details.",
          "Ensure your photos accurately reflect the experience.",
        ],
        relatedReviews: true,
        faqLinks: [
          "https://supply.getyourguide.support/hc/en-us/articles/13981009256605-Adding-Description-and-Highlights-for-Your-Product",
        ],
        pageLinkLabel: "Review activity details",
        count: 8,
      },
      {
        name: "Attraction or stop was closed",
        description: "Customers arrived to find the attraction unexpectedly closed.",
        recAction: "",
        recommendations: [
          "List any stops or attractions that are closed on certain days in Know Before You Go.",
        ],
        relatedReviews: false,
        faqLinks: [],
        pageLinkLabel: "Review activity details",
      },
    ],
  },
  {
    category: "Meeting point or pickup problems",
    defects: [
      {
        name: "Unclear meeting point location",
        description: "The meeting point description was not clear, or wrong.",
        recAction: "VizOps - Add meeting point picture",
        recommendations: ["Ensure the meeting point address is clear and up to date."],
        relatedReviews: false,
        faqLinks: ["Introducing Meeting Point Pictures"],
        pageLinkLabel: "Review activity details",
        count: 6,
      },
      {
        name: "Driver/guide were late or did not show up",
        description: "The guide or driver arrived late or did not show up.",
        recAction: "",
        recommendations: [
          "Have drivers/guides arrive 10–15 minutes early.",
          "Try assigning guides to bookings to help customers find them.",
        ],
        relatedReviews: true,
        faqLinks: [],
        pageLinkLabel: "",
      },
    ],
  },
];

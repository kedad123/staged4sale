/* Fake client file for the portal demo. Nothing here is a real account,
   address, or bill. Replace this file to show a different sample. */
window.PortalSample = {
  banner: "Sample / demo data",
  client: {
    firstName: "Alex",
    fullName: "Alex Morgan",
    email: "alex.morgan@example.com"
  },
  property: {
    addressLine1: "1842 Sample Ridge Road",
    addressLine2: "Rancho Santa Fe, CA 92067",
    photo: "../images/projects/monte-fuego-ranch/monte-fuego-ranch-01.jpg",
    photoAlt: "Staged living room with neutral seating framed by arched openings",
    photoNote: "Photo reused from the Monte Fuego Ranch portfolio. The street address is fictional."
  },
  status: {
    steps: ["Consultation", "Quote", "Staging Day", "Listed", "Sold", "Destage"],
    current: "Listed",
    note: "This sample home is on the market. Destage is the step after it sells."
  },
  dates: [
    { label: "Staging date", iso: "2026-09-18", detail: "Completed" },
    { label: "Destage date", iso: "2026-11-02", detail: "Scheduled" }
  ],
  invoice: {
    number: "SAMPLE-1042",
    issued: "2026-09-08",
    status: "Accepted (sample)",
    paid: 2000,
    items: [
      { label: "Vacant staging — living, dining, and primary suite", amount: 4200 },
      { label: "Art and accessory package", amount: 650 },
      { label: "Delivery and installation", amount: 850 },
      { label: "Furniture rental, first 30 days", amount: 1200 }
    ]
  },
  gallery: [
    {
      room: "Living room",
      before: {
        src: "../images/projects/monte-fuego-ranch/monte-fuego-ranch-01-before.webp",
        alt: "Before: unfurnished living room with a dark valance and bold wall color"
      },
      after: {
        src: "../images/projects/monte-fuego-ranch/monte-fuego-ranch-01.jpg",
        alt: "After: furniture framing the arches, with layered neutral textiles"
      }
    },
    {
      room: "Kitchen",
      before: {
        src: "../images/projects/monte-fuego-ranch/monte-fuego-ranch-02-before.webp",
        alt: "Before: undressed kitchen with high-contrast cabinetry"
      },
      after: {
        src: "../images/projects/monte-fuego-ranch/monte-fuego-ranch-02.jpg",
        alt: "After: kitchen styled lightly so the cabinetry and size stay visible"
      }
    },
    {
      room: "Family room",
      before: {
        src: "../images/projects/monte-fuego-ranch/monte-fuego-ranch-03-before.webp",
        alt: "Before: bright empty room without a defined seating area"
      },
      after: {
        src: "../images/projects/monte-fuego-ranch/monte-fuego-ranch-03.jpg",
        alt: "After: family room with a rounded furniture layout and layered neutrals"
      }
    },
    {
      room: "Sitting area",
      before: {
        src: "../images/projects/monte-fuego-ranch/monte-fuego-ranch-04-before.webp",
        alt: "Before: stark living space with harsh contrast"
      },
      after: {
        src: "../images/projects/monte-fuego-ranch/monte-fuego-ranch-04.jpg",
        alt: "After: sitting area with coordinated upholstery, art, and light accents"
      }
    }
  ],
  documents: [
    {
      id: "staging-agreement",
      title: "Staging agreement",
      status: "Signed",
      iso: "2026-09-04",
      paragraphs: [
        "This page stands in for a signed staging agreement. It is demo copy for the client portal sample, not a contract, and nobody has agreed to it.",
        "Sample client: {{clientName}} ({{clientEmail}}).",
        "Sample property: {{address}}.",
        "Shown as prepared by {{businessName}}. Questions in a real portal would go to {{advisorName}} at {{email}}."
      ]
    },
    {
      id: "inventory-list",
      title: "Inventory list",
      status: "Placeholder",
      iso: "2026-09-18",
      paragraphs: [
        "A finished portal would list the sofas, art, and accessories placed in the home. This sample does not.",
        "There is no furniture record here for {{address}}, and nothing on this page describes items in a real house."
      ]
    }
  ]
};

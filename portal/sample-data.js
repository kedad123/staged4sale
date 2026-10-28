/* Fake VIP member file for the portal demo. Nothing here is a real
   account, address, bill, or market report. Replace this file to
   show a different sample. */
window.PortalSample = {
  banner: "Sample / demo data",
  agent: {
    firstName: "Jordan",
    fullName: "Jordan Hale",
    email: "jordan.hale@example.com",
    phone: "(760) 555-0148",
    license: "DRE #00000000 (sample)",
    brokerage: {
      name: "Coastline Sample Realty",
      initials: "CSR",
      primary: "#1f4b6e",
      accent: "#d08c3a"
    },
    notifications: {
      projects: true,
      invoices: true,
      newsletter: false,
      booking: true
    }
  },
  perks: [
    {
      title: "Priority booking",
      text: "Member installs are placed ahead of the general calendar."
    },
    {
      title: "VIP pricing",
      text: "Sample member rates are shown on Billing & Payments."
    },
    {
      title: "Free virtual staging",
      text: "Included for members. This demo does not create an image."
    }
  ],
  listings: [
    {
      id: "harbor",
      addressLine1: "910 Demo Harbor Lane",
      addressLine2: "Oceanside, CA 92054",
      photo: "../images/projects/anchor-point-hideaway/anchor-point-hideaway-01.jpg",
      photoAlt: "Living room with layered seating, from the Anchor Point Hideaway portfolio. Used as a sample photo.",
      photoNote: "Photo reused from the Anchor Point Hideaway portfolio. The street address is fictional.",
      status: {
        steps: ["Consultation", "Quote", "Staging Day", "Listed", "Sold", "Destage"],
        current: "Staging Day",
        note: "Install is on the calendar. This sample has no photos from the house yet."
      },
      dates: [
        { label: "Consultation", iso: "2026-10-08", detail: "Completed" },
        { label: "Staging date", iso: "2026-10-28", detail: "Scheduled" },
        { label: "Target list date", iso: "2026-11-06", detail: "Seller's target" }
      ],
      invoice: {
        number: "SAMPLE-1108",
        issued: "2026-10-09",
        status: "Deposit received (sample)",
        paid: 500,
        vipNote: "Sample VIP rate. Standard pricing is compared on Billing & Payments.",
        items: [
          { label: "Occupied staging — living, dining, and primary bedroom", amount: 2800 },
          { label: "Accessory edit", amount: 400 }
        ]
      },
      gallery: [],
      galleryNote: "Before and after photos show up here after install. None are in this sample yet.",
      documents: [
        {
          id: "harbor-agreement",
          title: "Staging agreement",
          status: "Out for signature",
          iso: "2026-10-09",
          paragraphs: [
            "This page stands in for a staging agreement waiting on a signature. It is demo copy, not a contract, and nobody has agreed to it.",
            "Sample agent: {{agentName}} ({{agentEmail}}), {{brokerage}}.",
            "Sample property: {{address}}.",
            "Shown as prepared by {{businessName}}. Questions in a real portal would go to {{advisorName}} at {{email}}."
          ]
        }
      ]
    },
    {
      id: "mesa",
      addressLine1: "44 Placeholder Mesa Court",
      addressLine2: "Encinitas, CA 92024",
      photo: "../images/projects/canyon-view-condo/canyon-view-condo-01.webp",
      photoAlt: "Living room with a stone fireplace, from the Canyon View Condo portfolio. Used as a sample photo.",
      photoNote: "Photo reused from the Canyon View Condo portfolio. The street address is fictional.",
      status: {
        steps: ["Consultation", "Quote", "Staging Day", "Listed", "Sold", "Destage"],
        current: "Quote",
        note: "The sample quote is with the agent. Staging day is not booked yet."
      },
      dates: [
        { label: "Consultation", iso: "2026-10-12", detail: "Completed" },
        { label: "Quote sent", iso: "2026-10-14", detail: "Waiting on approval" },
        { label: "Target list date", iso: "2026-11-18", detail: "Seller's target" }
      ],
      invoice: {
        number: "SAMPLE-1114",
        issued: "2026-10-14",
        status: "Quote open (sample)",
        paid: 0,
        vipNote: "Sample VIP rate on an open quote. Nothing is owed until it is accepted.",
        items: [
          { label: "Vacant staging — main living rooms and primary suite", amount: 3600 },
          { label: "Art and accessory package", amount: 500 }
        ]
      },
      gallery: [],
      galleryNote: "This sample is still at the quote step, so there are no install photos.",
      documents: [
        {
          id: "mesa-quote",
          title: "Staging quote",
          status: "Sent",
          iso: "2026-10-14",
          paragraphs: [
            "This page stands in for a quote. It is demo copy, not an offer, and nobody has accepted it.",
            "Sample agent: {{agentName}} ({{agentEmail}}), {{brokerage}}.",
            "Sample property: {{address}}.",
            "Shown as prepared by {{businessName}}. Questions in a real portal would go to {{advisorName}} at {{email}}."
          ]
        }
      ]
    },
    {
      id: "ridge",
      addressLine1: "1842 Sample Ridge Road",
      addressLine2: "Rancho Santa Fe, CA 92067",
      photo: "../images/projects/monte-fuego-ranch/monte-fuego-ranch-01.jpg",
      photoAlt: "Staged living room with neutral seating framed by arched openings",
      photoNote: "Photo reused from the Monte Fuego Ranch portfolio. The street address is fictional.",
      status: {
        steps: ["Consultation", "Quote", "Staging Day", "Listed", "Sold", "Destage"],
        current: "Listed",
        note: "This sample home is on the market. Destage is the step after it sells."
      },
      dates: [
        { label: "Staging date", iso: "2026-09-18", detail: "Completed" },
        { label: "Listed", iso: "2026-10-01", detail: "On market in this sample" },
        { label: "Destage date", iso: "2026-11-02", detail: "Scheduled" }
      ],
      invoice: {
        number: "SAMPLE-1042",
        issued: "2026-09-08",
        status: "Balance due (sample)",
        paid: 2000,
        vipNote: "Sample VIP rate. The Billing page shows the standard price beside it.",
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
          id: "ridge-agreement",
          title: "Staging agreement",
          status: "Signed",
          iso: "2026-09-04",
          paragraphs: [
            "This page stands in for a signed staging agreement. It is demo copy for the VIP portal sample, not a contract, and nobody has agreed to it.",
            "Sample agent: {{agentName}} ({{agentEmail}}), {{brokerage}}.",
            "Sample property: {{address}}.",
            "Shown as prepared by {{businessName}}. Questions in a real portal would go to {{advisorName}} at {{email}}."
          ]
        },
        {
          id: "ridge-inventory",
          title: "Inventory list",
          status: "Placeholder",
          iso: "2026-09-18",
          paragraphs: [
            "A finished portal would list the sofas, art, and accessories placed in the home. This sample does not.",
            "There is no furniture record here for {{address}}, and nothing on this page describes items in a real house."
          ]
        }
      ]
    },
    {
      id: "grove",
      addressLine1: "77 Example Grove Place",
      addressLine2: "San Marcos, CA 92078",
      photo: "../images/projects/san-pasqual-retreat/san-pasqual-retreat-05.jpg",
      photoAlt: "Great room with neutral seating, from the San Pasqual Retreat portfolio. Used as a sample photo.",
      photoNote: "Photo reused from the San Pasqual Retreat portfolio. The street address is fictional.",
      status: {
        steps: ["Consultation", "Quote", "Staging Day", "Listed", "Sold", "Destage"],
        current: "Consultation",
        note: "The walkthrough is still ahead. No quote has been written in this sample."
      },
      dates: [
        { label: "Consultation", iso: "2026-11-03", detail: "Scheduled" },
        { label: "Target list date", iso: "2026-12-01", detail: "Seller's target" }
      ],
      invoice: {
        number: "SAMPLE-1120",
        issued: "2026-10-20",
        status: "No balance (sample)",
        paid: 0,
        vipNote: "Consultations are included for VIP members in this sample.",
        items: [
          { label: "Listing consultation — included for VIP members", amount: 0 }
        ]
      },
      gallery: [],
      galleryNote: "Photos will land here after the home is staged. This listing is still at consultation.",
      documents: [
        {
          id: "grove-consult",
          title: "Consultation note",
          status: "Scheduled",
          iso: "2026-11-03",
          paragraphs: [
            "This page stands in for a consultation note that has not been written yet. It is demo copy.",
            "Sample agent: {{agentName}} ({{agentEmail}}), {{brokerage}}.",
            "Sample property: {{address}}.",
            "Shown as prepared by {{businessName}}. Questions in a real portal would go to {{advisorName}} at {{email}}."
          ]
        }
      ]
    },
    {
      id: "crest",
      addressLine1: "2200 Fictional Crest Drive",
      addressLine2: "Carlsbad, CA 92009",
      photo: "../images/projects/cresta-view-estate/cresta-view-estate-01.jpg",
      photoAlt: "Kitchen with bar seating, from the Cresta View Estate portfolio. Used as a sample photo.",
      photoNote: "Photo reused from the Cresta View Estate portfolio. The street address is fictional.",
      status: {
        steps: ["Consultation", "Quote", "Staging Day", "Listed", "Sold", "Destage"],
        current: "Sold",
        note: "The sample listing has sold. Destage is the remaining step."
      },
      dates: [
        { label: "Staging date", iso: "2026-08-06", detail: "Completed" },
        { label: "Sold", iso: "2026-10-09", detail: "In this sample" },
        { label: "Destage date", iso: "2026-10-30", detail: "Scheduled" }
      ],
      invoice: {
        number: "SAMPLE-0988",
        issued: "2026-07-28",
        status: "Paid (sample)",
        paid: 6700,
        vipNote: "Sample VIP rate. This invoice is marked paid. Nothing was charged.",
        items: [
          { label: "Vacant staging — living, kitchen, and primary suite", amount: 5100 },
          { label: "Art and accessory package", amount: 700 },
          { label: "Delivery and installation", amount: 900 }
        ]
      },
      gallery: [
        {
          room: "Family room",
          before: {
            src: "../images/projects/cresta-view-estate/cresta-view-estate-03-before.jpg",
            alt: "Before photo from the Cresta View Estate portfolio, used as a sample"
          },
          after: {
            src: "../images/projects/cresta-view-estate/cresta-view-estate-03.jpg",
            alt: "Staged family room from the Cresta View Estate portfolio, used as a sample"
          }
        }
      ],
      documents: [
        {
          id: "crest-agreement",
          title: "Staging agreement",
          status: "Signed",
          iso: "2026-07-22",
          paragraphs: [
            "This page stands in for a signed staging agreement on a sold sample listing. It is demo copy, not a contract, and nobody has agreed to it.",
            "Sample agent: {{agentName}} ({{agentEmail}}), {{brokerage}}.",
            "Sample property: {{address}}.",
            "Shown as prepared by {{businessName}}. Questions in a real portal would go to {{advisorName}} at {{email}}."
          ]
        },
        {
          id: "crest-inventory",
          title: "Inventory list",
          status: "Placeholder",
          iso: "2026-08-06",
          paragraphs: [
            "A finished portal would list the pieces placed for the listing. This sample does not.",
            "There is no furniture record here for {{address}}."
          ]
        }
      ]
    }
  ],
  packets: [
    {
      id: "guide",
      title: "Seller staging guide",
      intro: "A short leave-behind that explains what staging does for the listing and what the seller handles before install.",
      points: [
        "The first photos carry the listing, so the rooms buyers see online get styled first.",
        "Personal photos, fridge notes, and extra furniture go into storage before staging day.",
        "A vacant install in this sample is planned as one weekday, with photos the next morning.",
        "Furniture in this sample stays through the listing and comes out at destage.",
        "The staging phone number and email stay on this page so the seller knows who to call."
      ]
    },
    {
      id: "prep",
      title: "Pre-listing prep checklist",
      intro: "What the seller finishes before the truck arrives. Sample checklist, not a work order.",
      points: [
        "Clear counters, refrigerator doors, and nightstands.",
        "Swap dark or mixed bulbs for one warm matching set.",
        "Patch nail holes and keep the paint neutral.",
        "Deep clean floors the day before install.",
        "Leave a lockbox code and a parking spot for the truck."
      ]
    },
    {
      id: "dayof",
      title: "Staging day: what to expect",
      intro: "A one-page preview of install morning so the seller is not surprised. Sample timing only.",
      points: [
        "Sample arrival window: 9:00–11:00 a.m. A real portal would show the booked window.",
        "Pets are secured before the crew comes in.",
        "Occupied homes are styled one room at a time so the seller still has a place to sit.",
        "Listing photos are usually the next morning, after the beds are dressed.",
        "Destage is booked after the sale, not on staging day."
      ]
    }
  ],
  market: {
    disclaimer: "Illustrative sample data. These figures were invented for this demo. They are not MLS statistics, not a market report, and not a valuation. The ZIP codes below are real North County labels only. Changing the ZIP swaps another canned sample. It does not look anything up.",
    areas: [
      {
        zip: "92054",
        city: "Oceanside",
        active: 86,
        medianList: 1125000,
        medianPpsf: 612,
        medianDom: 28,
        sold30: 41,
        listToSale: 98.4,
        listed: 86,
        trend: [3.4, 3.1, 2.8, 3.0, 2.6, 2.9],
        mix: [
          { label: "Staged", count: 22, color: "#ffd700" },
          { label: "Virtually staged", count: 9, color: "#e0a100" },
          { label: "Vacant", count: 18, color: "#8a8a8a" },
          { label: "Lived-in", count: 24, color: "#d5d0c4" },
          { label: "Occupied-tidy", count: 13, color: "#8d7340" }
        ],
        roi: {
          staged: { dom: 18, ppsf: 648 },
          vacant: { dom: 41, ppsf: 571 }
        }
      },
      {
        zip: "92024",
        city: "Encinitas",
        active: 54,
        medianList: 2450000,
        medianPpsf: 1180,
        medianDom: 33,
        sold30: 19,
        listToSale: 97.2,
        listed: 54,
        trend: [2.2, 2.4, 2.1, 1.9, 2.3, 2.0],
        mix: [
          { label: "Staged", count: 16, color: "#ffd700" },
          { label: "Virtually staged", count: 4, color: "#e0a100" },
          { label: "Vacant", count: 11, color: "#8a8a8a" },
          { label: "Lived-in", count: 14, color: "#d5d0c4" },
          { label: "Occupied-tidy", count: 9, color: "#8d7340" }
        ],
        roi: {
          staged: { dom: 21, ppsf: 1240 },
          vacant: { dom: 46, ppsf: 1095 }
        }
      },
      {
        zip: "92009",
        city: "Carlsbad",
        active: 73,
        medianList: 1395000,
        medianPpsf: 705,
        medianDom: 24,
        sold30: 36,
        listToSale: 99.1,
        listed: 73,
        trend: [2.8, 2.5, 2.7, 2.2, 2.4, 2.1],
        mix: [
          { label: "Staged", count: 20, color: "#ffd700" },
          { label: "Virtually staged", count: 11, color: "#e0a100" },
          { label: "Vacant", count: 14, color: "#8a8a8a" },
          { label: "Lived-in", count: 17, color: "#d5d0c4" },
          { label: "Occupied-tidy", count: 11, color: "#8d7340" }
        ],
        roi: {
          staged: { dom: 16, ppsf: 742 },
          vacant: { dom: 38, ppsf: 668 }
        }
      }
    ]
  },
  newsletter: {
    issueLabel: "Sample issue",
    dateLabel: "October 2026",
    title: "What changed when the sample homes were staged",
    dek: "A members preview. Every figure in this issue is illustrative demo copy, not a study and not a promise about a listing.",
    sections: [
      {
        heading: "One sample, two readings",
        body: "In the canned 92054 report, staged homes are given 18 median days on market and vacant homes 41. That gap is a teaching prop for this demo. It is not a measured Oceanside result. Open Market Info to see the full sample, including the staging mix."
      },
      {
        heading: "How agents use the packet",
        body: "The seller packet is the leave-behind for the listing appointment. Your brokerage mark sits beside the stager, and the stager's phone number stays on the page. Pick a guide, a prep checklist, or a staging-day sheet. Download on this demo does not create a file."
      },
      {
        heading: "A note for members",
        body: "Priority booking, member pricing, and virtual staging are the three sample perks on My Listings. Virtual staging in this portal does not call an image tool. Listing photos that are digitally altered still need a disclosure and the original, which the Virtual Staging page shows with a label."
      }
    ]
  },
  virtual: {
    freeNote: "Virtual staging is free for VIP members. This demo does not generate, edit, or upload an image.",
    disclosure: "California AB 723 requires disclosing digitally altered listing photos and providing the original. The after image is labeled Virtually staged, and the original sits beside it. This is not legal advice. The after photo is a real portfolio photograph used only to show the label, not a digitally altered listing photo.",
    example: {
      room: "Living room",
      before: {
        src: "../images/projects/monte-fuego-ranch/monte-fuego-ranch-01-before.webp",
        alt: "Original portfolio photo of an unfurnished living room, shown as the unaltered image in this sample"
      },
      after: {
        src: "../images/projects/monte-fuego-ranch/monte-fuego-ranch-01.jpg",
        alt: "Portfolio photo of the same living room after physical staging, labeled Virtually staged only to demonstrate the disclosure"
      }
    }
  },
  billing: {
    intro: "Sample invoices for this member. VIP prices are illustrative, not a rate card. Pay does not collect a card or start a payment.",
    invoices: [
      {
        id: "SAMPLE-1108",
        listingId: "harbor",
        address: "910 Demo Harbor Lane",
        issued: "2026-10-09",
        status: "Deposit received (sample)",
        paid: 500,
        settled: false,
        lines: [
          { label: "Occupied staging — living, dining, and primary bedroom", standard: 3300, vip: 2800 },
          { label: "Accessory edit", standard: 480, vip: 400 }
        ]
      },
      {
        id: "SAMPLE-1114",
        listingId: "mesa",
        address: "44 Placeholder Mesa Court",
        issued: "2026-10-14",
        status: "Quote open (sample)",
        paid: 0,
        settled: false,
        lines: [
          { label: "Vacant staging — main living rooms and primary suite", standard: 4200, vip: 3600 },
          { label: "Art and accessory package", standard: 600, vip: 500 }
        ]
      },
      {
        id: "SAMPLE-1042",
        listingId: "ridge",
        address: "1842 Sample Ridge Road",
        issued: "2026-09-08",
        status: "Balance due (sample)",
        paid: 2000,
        settled: false,
        lines: [
          { label: "Vacant staging — living, dining, and primary suite", standard: 4900, vip: 4200 },
          { label: "Art and accessory package", standard: 750, vip: 650 },
          { label: "Delivery and installation", standard: 850, vip: 850 },
          { label: "Furniture rental, first 30 days", standard: 1400, vip: 1200 }
        ]
      },
      {
        id: "SAMPLE-1120",
        listingId: "grove",
        address: "77 Example Grove Place",
        issued: "2026-10-20",
        status: "No balance (sample)",
        paid: 0,
        settled: true,
        lines: [
          { label: "Listing consultation", standard: 250, vip: 0 }
        ]
      },
      {
        id: "SAMPLE-0988",
        listingId: "crest",
        address: "2200 Fictional Crest Drive",
        issued: "2026-07-28",
        status: "Paid (sample)",
        paid: 6700,
        settled: true,
        lines: [
          { label: "Vacant staging — living, kitchen, and primary suite", standard: 5900, vip: 5100 },
          { label: "Art and accessory package", standard: 820, vip: 700 },
          { label: "Delivery and installation", standard: 900, vip: 900 }
        ]
      }
    ]
  }
};

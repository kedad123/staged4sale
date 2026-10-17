/* Fake book of work for the admin demo.
   Nothing here is a real client, address, phone, or invoice.
   Dates are offset from the day the page is opened so the
   dashboard and calendar stay populated. */
(function () {
  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function ymd(date) {
    return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
  }

  function fromToday(offsetDays) {
    var date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + offsetDays);
    return ymd(date);
  }

  function monthDay(day) {
    var now = new Date();
    var last = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    var date = new Date(now.getFullYear(), now.getMonth(), Math.min(day, last), 12, 0, 0, 0);
    return ymd(date);
  }

  window.AdminSample = {
    banner: "Sample / demo data — made-up clients, addresses, and amounts",
    clients: [
      {
        id: "maya-chen",
        name: "Maya Chen",
        role: "Realtor",
        company: "Example Realty",
        email: "maya.chen@example.com",
        phone: "(760) 555-0148",
        phoneTel: "+17605550148",
        notes: "Repeat client in this sample. Prefers a light coastal palette and a text the morning of install."
      },
      {
        id: "jordan-hale",
        name: "Jordan Hale",
        role: "Homeowner",
        company: "",
        email: "jordan.hale@example.com",
        phone: "(760) 555-0162",
        phoneTel: "+17605550162",
        notes: "Will be out of the house by 8:00 a.m. on staging day. The dog is with a neighbor that morning."
      },
      {
        id: "priya-nandakumar",
        name: "Priya Nandakumar",
        role: "Realtor",
        company: "Example Coastal Realty",
        email: "priya.nandakumar@example.com",
        phone: "(760) 555-0190",
        phoneTel: "+17605550190",
        notes: "Two listings in this sample. Both invoices use the same example.com address."
      },
      {
        id: "luis-ortega",
        name: "Luis Ortega",
        role: "Investor",
        company: "",
        email: "luis.ortega@example.com",
        phone: "(760) 555-0114",
        phoneTel: "+17605550114",
        notes: "Furniture can come out once the sample sale is marked sold. Park in the driveway for pickup."
      },
      {
        id: "elena-brooks",
        name: "Elena Brooks",
        role: "Homeowner",
        company: "",
        email: "elena.brooks@example.com",
        phone: "(442) 555-0177",
        phoneTel: "+14425550177",
        notes: "Asked for a consultation before deciding on a full vacant staging."
      },
      {
        id: "chris-dalton",
        name: "Chris Dalton",
        role: "Realtor",
        company: "Example Mesa Group",
        email: "chris.dalton@example.com",
        phone: "(760) 555-0133",
        phoneTel: "+17605550133",
        notes: "Waiting on the seller to approve the sample quote. No date is held yet."
      }
    ],
    jobs: [
      {
        id: "j-elena",
        clientId: "elena-brooks",
        address: "742 Sample Olive Street",
        city: "San Marcos",
        region: "CA",
        service: "Consultation",
        status: "inquiry",
        amount: 350,
        invoicedOn: null,
        note: "Wants to know which rooms matter most before hiring a full stage."
      },
      {
        id: "j-chris",
        clientId: "chris-dalton",
        address: "1288 Sample Juniper Road",
        city: "Escondido",
        region: "CA",
        service: "Vacant staging",
        status: "quoted",
        amount: 5200,
        invoicedOn: null,
        note: "Quote covers living, dining, primary suite, and the back patio."
      },
      {
        id: "j-jordan",
        clientId: "jordan-hale",
        address: "907 Sample Citrus Court",
        city: "Carlsbad",
        region: "CA",
        service: "Occupied staging",
        status: "scheduled",
        amount: 3600,
        invoicedOn: null,
        note: "Use a mix of their furniture and a few rental pieces in the living room."
      },
      {
        id: "j-priya-lupine",
        clientId: "priya-nandakumar",
        address: "18 Sample Lupine Court",
        city: "Oceanside",
        region: "CA",
        service: "Vacant staging",
        status: "scheduled",
        amount: 4500,
        invoicedOn: null,
        note: "Lockbox is on the front gate in this sample work order."
      },
      {
        id: "j-maya-ridge",
        clientId: "maya-chen",
        address: "1842 Sample Ridge Road",
        city: "Encinitas",
        region: "CA",
        service: "Vacant staging",
        status: "staged",
        amount: 4800,
        invoicedOn: monthDay(12),
        note: "Installed. Listing photos are already in the sample file."
      },
      {
        id: "j-priya-mesa",
        clientId: "priya-nandakumar",
        address: "55 Sample Mesa Way",
        city: "Oceanside",
        region: "CA",
        service: "Vacant staging",
        status: "listed",
        amount: 6100,
        invoicedOn: monthDay(6),
        note: "On the market in this sample. Pickup waits until it sells."
      },
      {
        id: "j-luis",
        clientId: "luis-ortega",
        address: "310 Sample Harbor Drive",
        city: "Vista",
        region: "CA",
        service: "Vacant staging",
        status: "sold",
        amount: 5400,
        invoicedOn: monthDay(16),
        note: "Sale is recorded in the sample. Pickup is on the calendar."
      },
      {
        id: "j-maya-paloma",
        clientId: "maya-chen",
        address: "460 Sample Paloma Avenue",
        city: "Solana Beach",
        region: "CA",
        service: "Occupied staging",
        status: "done",
        amount: 2900,
        invoicedOn: monthDay(2),
        note: "Pickup is finished in this sample. Furniture is back in the warehouse."
      }
    ],
    appointments: [
      {
        id: "a-paloma-out",
        jobId: "j-maya-paloma",
        type: "destage",
        date: fromToday(-9),
        minutes: 10 * 60,
        note: "Pickup completed in this sample."
      },
      {
        id: "a-ridge-in",
        jobId: "j-maya-ridge",
        type: "stage",
        date: fromToday(-5),
        minutes: 9 * 60,
        note: "Install finished in this sample. Three-piece seating and a dining table."
      },
      {
        id: "a-harbor-out",
        jobId: "j-luis",
        type: "destage",
        date: fromToday(2),
        minutes: 13 * 60,
        note: "Two-story. Most of the furniture is on the main floor."
      },
      {
        id: "a-citrus-in",
        jobId: "j-jordan",
        type: "stage",
        date: fromToday(4),
        minutes: 9 * 60 + 30,
        note: "Occupied. They cleared the primary bedroom closet for a few accessories."
      },
      {
        id: "a-lupine-in",
        jobId: "j-priya-lupine",
        type: "stage",
        date: fromToday(11),
        minutes: 8 * 60 + 30,
        note: "Vacant install. Allow extra time for the patio seating."
      },
      {
        id: "a-ridge-out",
        jobId: "j-maya-ridge",
        type: "destage",
        date: fromToday(18),
        minutes: 11 * 60,
        note: "Pickup after the sample listing closes."
      }
    ],
    leads: [
      {
        id: "l-samir",
        name: "Samir Patel",
        email: "samir.patel@example.com",
        phone: "(760) 555-0188",
        source: "Website form",
        date: fromToday(-1),
        property: "410 Sample Dune Lane, Carlsbad",
        message: "We are listing a vacant condo and would like staging before photos. The sample timeline is flexible over the next three weeks.",
        status: "new"
      },
      {
        id: "l-brooke",
        name: "Brooke Ellison",
        email: "brooke.ellison@example.com",
        phone: "(760) 555-0120",
        source: "Website form",
        date: fromToday(-2),
        property: "77 Sample Bluff Court, Encinitas",
        message: "Occupied home, three bedrooms. Hoping to book a walkthrough. This is demo copy, not a real inquiry.",
        status: "new"
      },
      {
        id: "l-andre",
        name: "Andre Williams",
        email: "andre.williams@example.com",
        phone: "(760) 555-0155",
        source: "Phone",
        date: fromToday(-5),
        property: "900 Sample Ranch Road, Vista",
        message: "Called about a vacant staging for an investor listing. A message was left in this sample.",
        status: "contacted"
      },
      {
        id: "l-nina",
        name: "Nina Cho",
        email: "nina.cho@example.com",
        phone: "(760) 555-0104",
        source: "Referral",
        date: fromToday(-8),
        property: "15 Sample Laurel Street, San Marcos",
        message: "Referred by another agent in this demo. Marked booked here only. This inbox does not open a job.",
        status: "booked"
      },
      {
        id: "l-harper",
        name: "Harper Quinn",
        email: "harper.quinn@example.com",
        phone: "(760) 555-0199",
        source: "Website form",
        date: fromToday(-12),
        property: "600 Sample Canyon Drive, Escondido",
        message: "Asked for a quote, then went another direction. Kept so the Dead status is visible in the sample.",
        status: "dead"
      }
    ]
  };
})();

/* Sample price list for the quote builder.
   This object is the whole config. A backend can replace it later
   by serving the same shape. The admin editor stores edits in
   localStorage under QuoteCatalog.KEY. Nothing is sent to a server.

   A quote has three optional sections: consultation, one staging
   package, and listing media. Travel is charged once per visit.
   extensionRooms on a quantity item means that quantity counts
   toward extension rooms. Occupied packages do not count their
   included rooms; only those add-on rooms do.

   placeholder: true means the number was not in the draft fixed
   list. The client-facing quote does not print that word. */
(function () {
  var KEY = "s4s-admin-quote-catalog-v3";

  var DEFAULTS = {
    version: 3,
    currency: "USD",
    quoteValidDays: 30,
    defaultPackageId: "",
    roomNote: "A room includes up to 5 pieces of furniture. Great rooms and other large rooms may count as two or more rooms.",
    consultation: {
      name: "Consultation",
      description: "One hour with a general written plan.",
      price: 250,
      hours: 1,
      credit: 250,
      placeholder: false
    },
    extension: {
      weeklyPerRoom: 50,
      monthlyPerRoom: 200,
      placeholder: false
    },
    consultationTerms: [
      "The consultation fee is due when the agreement is signed. This quote is not a commitment until then.",
      "The visit is one hour and includes a general written plan.",
      "This quote is valid through the date above."
    ],
    mediaTerms: [
      "The media fee is due when the agreement is signed. This quote is not a commitment until then.",
      "This quote is valid through the date above."
    ],
    terms: [
      "The staging fee is due when the agreement is signed. This quote is not a commitment until then.",
      "After the included period, furniture rental continues in prepaid one-week blocks at the weekly rate on this quote. It is not prorated.",
      "De-staging is included with at least 7 days' notice. Please call as soon as the property is in escrow. Shorter notice may incur a fee.",
      "The home should be professionally cleaned before installation. Please leave staged items as placed. Damage, loss, or theft is charged at replacement cost.",
      "A special style, color, or size request may cost extra. This quote is valid through the date above."
    ],
    packages: [
      {
        id: "partial",
        name: "Partial Staging",
        description: "Full styling by an ASPM Master Stager, furniture plus accessories. The client picks the two rooms.",
        price: 2000,
        kind: "vacant",
        includedRooms: 2,
        includedDays: 30,
        includesConsultation: false,
        placeholder: false
      },
      {
        id: "full-service",
        name: "Full-Service Staging",
        description: "Three rooms plus kitchen and bath accents. Includes consultation, furniture selection, accessories, and styling. Listing media is separate.",
        price: 3000,
        kind: "vacant",
        includedRooms: 3,
        includedDays: 60,
        includesConsultation: true,
        placeholder: false
      },
      {
        id: "occupied",
        name: "Occupied Styling & Accessories",
        description: "Living, dining, and primary bedroom, plus kitchen and bath accents, using the owner's furniture. Accessories stay 60 days. Delivery and pickup are included. Moving furniture is not included.",
        price: 1500,
        kind: "occupied",
        includedRooms: 0,
        includedDays: 60,
        includesConsultation: false,
        placeholder: false
      }
    ],
    media: {
      name: "Basic Media Package",
      description: "Listing media for the home.",
      price: 500,
      sqftThreshold: 2500,
      perSqFt: 0.1,
      placeholder: false
    },
    distance: {
      originZip: "92054",
      originLabel: "Oceanside, CA",
      freeMiles: 20,
      ratePerMile: 5,
      roadFactor: 1.2,
      placeholder: false
    },
    quantityItems: [
      {
        id: "extra-room",
        name: "Additional room",
        description: "Another room on a vacant staging.",
        unit: "room",
        pricing: "flat",
        price: 500,
        percent: 0,
        appliesTo: ["partial", "full-service"],
        extensionRooms: true,
        placeholder: false
      },
      {
        id: "furniture-rental",
        name: "Furniture Rental Add-on",
        description: "Furniture for one room when the home is occupied.",
        unit: "room",
        pricing: "flat",
        price: 500,
        percent: 0,
        appliesTo: ["occupied"],
        extensionRooms: true,
        placeholder: false
      },
      {
        id: "extra-furniture",
        name: "Extra furniture piece",
        description: "One furniture piece beyond the pieces included with a room.",
        unit: "piece",
        pricing: "flat",
        price: 100,
        percent: 0,
        placeholder: true
      },
      {
        id: "extra-accent",
        name: "Extra accent piece",
        description: "A pillow, throw, or small accessory beyond the included set.",
        unit: "piece",
        pricing: "flat",
        price: 25,
        percent: 0,
        placeholder: true
      }
    ],
    addons: [
      {
        id: "stairs",
        name: "Stairs / long carry",
        description: "Stairs, a long carry, or other difficult access.",
        price: 350,
        placeholder: true
      },
      {
        id: "patio",
        name: "Patio set",
        description: "Outdoor seating set.",
        price: 400,
        placeholder: true
      },
      {
        id: "rush",
        name: "Rush booking",
        description: "Install booked on short notice.",
        price: 300,
        placeholder: true
      }
    ]
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function clampInt(value, min, max, fallback) {
    var n = Math.round(Number(value));
    if (!isFinite(n)) return fallback;
    if (n < min) return min;
    if (n > max) return max;
    return n;
  }

  function clampNum(value, min, max, fallback) {
    return clampDecimal(value, min, max, fallback, 2);
  }

  function clampDecimal(value, min, max, fallback, places) {
    var n = Number(value);
    if (!isFinite(n)) return fallback;
    if (n < min) return min;
    if (n > max) return max;
    var factor = Math.pow(10, places);
    return Math.round(n * factor) / factor;
  }

  function cleanId(value) {
    return String(value || "").trim().slice(0, 40);
  }

  function sanitizePackage(item) {
    if (!item || typeof item !== "object") return null;
    var id = cleanId(item.id);
    if (!id) return null;
    return {
      id: id,
      name: String(item.name || "Package").trim().slice(0, 80) || "Package",
      description: String(item.description || "").trim().slice(0, 400),
      price: clampNum(item.price, 0, 10000000, 0),
      kind: item.kind === "occupied" ? "occupied" : "vacant",
      includedRooms: clampInt(item.includedRooms, 0, 99, 0),
      includedDays: clampInt(item.includedDays, 0, 365, 0),
      includesConsultation: !!item.includesConsultation,
      placeholder: !!item.placeholder
    };
  }

  function sanitizeQty(item) {
    if (!item || typeof item !== "object") return null;
    var id = cleanId(item.id);
    if (!id) return null;
    return {
      id: id,
      name: String(item.name || "Item").trim().slice(0, 80) || "Item",
      description: String(item.description || "").trim().slice(0, 400),
      unit: String(item.unit || "item").trim().slice(0, 24) || "item",
      pricing: item.pricing === "percent" || item.pricing === "per-room" ? item.pricing : "flat",
      price: clampNum(item.price, 0, 10000000, 0),
      percent: clampNum(item.percent, 0, 100, 0),
      appliesTo: appliesToList(item.appliesTo),
      extensionRooms: !!item.extensionRooms,
      placeholder: !!item.placeholder
    };
  }

  function appliesToList(value) {
    var out = [];
    if (!Array.isArray(value)) return out;
    value.forEach(function (id) {
      var clean = cleanId(id);
      if (clean && out.indexOf(clean) === -1 && out.length < 20) out.push(clean);
    });
    return out;
  }

  function sanitizeMedia(raw) {
    var seed = DEFAULTS.media;
    var item = raw && typeof raw === "object" ? raw : seed;
    return {
      name: String(item.name || seed.name).trim().slice(0, 80) || seed.name,
      description: String(item.description || "").trim().slice(0, 400),
      price: clampNum(item.price, 0, 10000000, seed.price),
      sqftThreshold: clampInt(item.sqftThreshold, 0, 1000000, seed.sqftThreshold),
      perSqFt: clampDecimal(item.perSqFt, 0, 1000, seed.perSqFt, 4),
      placeholder: !!item.placeholder
    };
  }

  function sanitizeDistance(raw) {
    var seed = DEFAULTS.distance;
    var item = raw && typeof raw === "object" ? raw : seed;
    var origin = String(item.originZip || seed.originZip).replace(/\D/g, "").slice(0, 5);
    if (origin.length !== 5) origin = seed.originZip;
    return {
      originZip: origin,
      originLabel: String(item.originLabel || seed.originLabel).trim().slice(0, 80) || seed.originLabel,
      freeMiles: clampInt(item.freeMiles, 0, 5000, seed.freeMiles),
      ratePerMile: clampNum(item.ratePerMile, 0, 100000, seed.ratePerMile),
      roadFactor: clampDecimal(item.roadFactor, 1, 3, seed.roadFactor, 2),
      placeholder: !!item.placeholder
    };
  }

  function termList(value, fallback) {
    var terms = [];
    var source = Array.isArray(value) ? value : fallback;
    if (!Array.isArray(source)) return [];
    source.forEach(function (term) {
      var text = String(term || "").trim().slice(0, 500);
      if (text && terms.length < 12) terms.push(text);
    });
    return terms;
  }

  function sanitizeConsultation(raw) {
    var seed = DEFAULTS.consultation;
    var item = raw && typeof raw === "object" ? raw : seed;
    return {
      name: String(item.name || seed.name).trim().slice(0, 80) || seed.name,
      description: String(item.description || seed.description).trim().slice(0, 400),
      price: clampNum(item.price, 0, 10000000, seed.price),
      hours: clampInt(item.hours, 1, 24, seed.hours),
      credit: clampNum(item.credit, 0, 10000000, seed.credit),
      placeholder: !!item.placeholder
    };
  }

  function sanitizeExtension(raw) {
    var seed = DEFAULTS.extension;
    var item = raw && typeof raw === "object" ? raw : seed;
    return {
      weeklyPerRoom: clampNum(item.weeklyPerRoom, 0, 100000, seed.weeklyPerRoom),
      monthlyPerRoom: clampNum(item.monthlyPerRoom, 0, 100000, seed.monthlyPerRoom),
      placeholder: !!item.placeholder
    };
  }

  function sanitizeAddon(item) {
    if (!item || typeof item !== "object") return null;
    var id = cleanId(item.id);
    if (!id) return null;
    return {
      id: id,
      name: String(item.name || "Add-on").trim().slice(0, 80) || "Add-on",
      description: String(item.description || "").trim().slice(0, 400),
      price: clampNum(item.price, 0, 10000000, 0),
      placeholder: !!item.placeholder
    };
  }

  function sanitizeList(list, map) {
    if (!Array.isArray(list)) return null;
    var out = [];
    var seen = {};
    list.forEach(function (item) {
      var clean = map(item);
      if (!clean || seen[clean.id]) return;
      seen[clean.id] = true;
      out.push(clean);
    });
    return out;
  }

  function sanitize(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
    var packages = sanitizeList(raw.packages, sanitizePackage);
    var quantityItems = sanitizeList(raw.quantityItems, sanitizeQty);
    var addons = sanitizeList(raw.addons, sanitizeAddon);
    if (!packages || !quantityItems || !addons) return null;
    var terms = [];
    if (Array.isArray(raw.terms)) {
      raw.terms.forEach(function (term) {
        var text = String(term || "").trim().slice(0, 500);
        if (text && terms.length < 12) terms.push(text);
      });
    }
    var ids = packages.map(function (pkg) { return pkg.id; });
    var defaultPackageId = cleanId(raw.defaultPackageId);
    if (defaultPackageId && ids.indexOf(defaultPackageId) === -1) defaultPackageId = "";
    return {
      version: 3,
      currency: "USD",
      quoteValidDays: clampInt(raw.quoteValidDays, 1, 365, 30),
      defaultPackageId: defaultPackageId,
      roomNote: String(raw.roomNote || DEFAULTS.roomNote).trim().slice(0, 400),
      consultation: sanitizeConsultation(raw.consultation),
      extension: sanitizeExtension(raw.extension),
      consultationTerms: termList(raw.consultationTerms, DEFAULTS.consultationTerms),
      mediaTerms: termList(raw.mediaTerms, DEFAULTS.mediaTerms),
      terms: terms.length ? terms : DEFAULTS.terms.slice(),
      packages: packages,
      quantityItems: quantityItems,
      addons: addons,
      media: sanitizeMedia(raw.media),
      distance: sanitizeDistance(raw.distance)
    };
  }

  function defaults() {
    return clone(DEFAULTS);
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return defaults();
      var clean = sanitize(JSON.parse(raw));
      return clean || defaults();
    } catch (e) {
      return defaults();
    }
  }

  function save(catalog) {
    var clean = sanitize(catalog);
    if (!clean) return false;
    try {
      localStorage.setItem(KEY, JSON.stringify(clean));
      return true;
    } catch (e) {
      return false;
    }
  }

  function reset() {
    try {
      localStorage.removeItem(KEY);
    } catch (e) {}
    return defaults();
  }

  window.QuoteCatalog = {
    KEY: KEY,
    defaults: defaults,
    load: load,
    save: save,
    reset: reset,
    sanitize: sanitize
  };
})();

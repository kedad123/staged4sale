/* Sample price list for the quote builder.
   This object is the whole config. A backend can replace it later
   by serving the same shape. The admin editor stores edits in
   localStorage under QuoteCatalog.KEY. Nothing is sent to a server.

   mediaIncluded, includedMonths, includedRooms, and piecesPerRoom
   describe what the package price already covers. They are not
   added on top of the package price.

   placeholder: true means the number was not in the draft fixed
   list. The client-facing quote does not print that word. */
(function () {
  var KEY = "s4s-admin-quote-catalog-v1";

  var DEFAULTS = {
    version: 1,
    currency: "USD",
    quoteValidDays: 30,
    defaultPackageId: "full-service",
    terms: [
      "The staging fee is due when the agreement is signed. This quote is not a commitment until then.",
      "After the included rental period, rental continues at the extension rate shown on this quote. Rental is not prorated.",
      "De-staging is included with at least 7 days' notice. Please call as soon as the property is in escrow. Shorter notice may incur a fee.",
      "The home should be professionally cleaned before installation. Please leave staged items as placed. Damage, loss, or theft is charged at replacement cost.",
      "A special style, color, or size request may cost extra. This quote is valid through the date above."
    ],
    packages: [
      {
        id: "consultation",
        name: "Consultation",
        description: "Walk-through of the property with recommendations for staging.",
        price: 250,
        kind: "consult",
        includedRooms: 0,
        includedMonths: 0,
        mediaIncluded: 0,
        piecesPerRoom: 0,
        placeholder: false
      },
      {
        id: "full-service",
        name: "Full-Service Staging",
        description: "Furniture and accessories for the rooms in this package, chosen for the listing.",
        price: 3000,
        kind: "stage",
        includedRooms: 3,
        includedMonths: 2,
        mediaIncluded: 500,
        piecesPerRoom: 5,
        placeholder: false
      },
      {
        id: "minimal",
        name: "Minimal (accessories only)",
        description: "Accessories only, using the seller's own furniture.",
        price: 1800,
        kind: "stage",
        includedRooms: 0,
        includedMonths: 1,
        mediaIncluded: 0,
        piecesPerRoom: 0,
        placeholder: true
      }
    ],
    quantityItems: [
      {
        id: "extra-room",
        name: "Additional room",
        description: "Another staged room beyond the package.",
        unit: "room",
        pricing: "flat",
        price: 750,
        percent: 0,
        placeholder: true
      },
      {
        id: "extra-month",
        name: "Rental extension",
        description: "Each extra month after the rental included in the package.",
        unit: "month",
        pricing: "percent",
        price: 0,
        percent: 20,
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
        id: "occupied",
        name: "Occupied home",
        description: "Working around furniture the seller is keeping.",
        price: 500,
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
    var n = Number(value);
    if (!isFinite(n)) return fallback;
    if (n < min) return min;
    if (n > max) return max;
    return Math.round(n * 100) / 100;
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
      kind: item.kind === "consult" ? "consult" : "stage",
      includedRooms: clampInt(item.includedRooms, 0, 99, 0),
      includedMonths: clampInt(item.includedMonths, 0, 36, 0),
      mediaIncluded: clampNum(item.mediaIncluded, 0, 10000000, 0),
      piecesPerRoom: clampInt(item.piecesPerRoom, 0, 99, 0),
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
      pricing: item.pricing === "percent" ? "percent" : "flat",
      price: clampNum(item.price, 0, 10000000, 0),
      percent: clampNum(item.percent, 0, 100, 0),
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
    if (ids.indexOf(defaultPackageId) === -1) defaultPackageId = ids[0] || "";
    return {
      version: 1,
      currency: "USD",
      quoteValidDays: clampInt(raw.quoteValidDays, 1, 365, 30),
      defaultPackageId: defaultPackageId,
      terms: terms,
      packages: packages,
      quantityItems: quantityItems,
      addons: addons
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

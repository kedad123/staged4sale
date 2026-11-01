/* Quote math, share-link codec, and the client-facing quote sheet.
   Amounts are integer cents. The public page only needs decodeHash
   and renderPaper. It does not read the price list. */
(function () {
  var FALLBACK = {
    business: "Staged4Sale",
    phone: "(760) 583-2500",
    phoneTel: "+17605832500",
    email: "sales@staged4sale.com",
    tagline: "Home staging · North County San Diego"
  };

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function ymd(date) {
    return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
  }

  function todayIso() {
    var now = new Date();
    return ymd(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0));
  }

  function parseIso(iso) {
    var match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ""));
    if (!match) return null;
    var y = Number(match[1]);
    var m = Number(match[2]);
    var d = Number(match[3]);
    var date = new Date(y, m - 1, d, 12, 0, 0, 0);
    if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
    return date;
  }

  function addDaysIso(iso, days) {
    var date = parseIso(iso) || parseIso(todayIso());
    date.setDate(date.getDate() + days);
    return ymd(date);
  }

  function formatLong(iso) {
    var date = parseIso(iso);
    if (!date) return "—";
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    }).format(date);
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
    return n;
  }

  function dollarsToCents(value) {
    var n = Number(value);
    if (!isFinite(n)) return 0;
    return Math.round(n * 100);
  }

  function percentOfCents(cents, percent) {
    return Math.round(Number(cents) * Number(percent) / 100);
  }

  function trimNum(value) {
    var n = Math.round(Number(value) * 100) / 100;
    if (!isFinite(n)) return "0";
    return String(n);
  }

  function money(cents) {
    var n = Math.round(Number(cents) || 0);
    var sign = n < 0 ? "-" : "";
    var abs = Math.abs(n);
    var dollars = Math.floor(abs / 100);
    var rem = abs % 100;
    return sign + "$" + dollars.toLocaleString("en-US") + "." + (rem < 10 ? "0" : "") + rem;
  }

  function moneyShort(cents) {
    return money(cents).replace(/\.00$/, "");
  }

  function plural(unit, qty) {
    var name = String(unit || "item");
    if (Number(qty) === 1) return name;
    if (name.toLowerCase() === "piece") return "pieces";
    if (/s$/i.test(name)) return name;
    return name + "s";
  }

  function newQuoteNumber(dateIso) {
    var compact = String(dateIso || todayIso()).replace(/-/g, "");
    var alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    var chars = "";
    for (var i = 0; i < 4; i++) chars += alphabet[Math.floor(Math.random() * alphabet.length)];
    return "S4S-" + compact + "-" + chars;
  }

  function contactBlock(contact) {
    contact = contact || {};
    return {
      business: contact.business || contact.businessName || FALLBACK.business,
      phone: contact.phone || contact.phoneDisplay || FALLBACK.phone,
      phoneTel: contact.phoneTel || FALLBACK.phoneTel,
      email: contact.email || FALLBACK.email,
      tagline: contact.tagline || FALLBACK.tagline
    };
  }

  function blankDraft(catalog) {
    catalog = catalog || {};
    var qty = {};
    (catalog.quantityItems || []).forEach(function (item) { qty[item.id] = 0; });
    var addons = {};
    (catalog.addons || []).forEach(function (item) { addons[item.id] = false; });
    var packageId = catalog.defaultPackageId || "";
    var known = (catalog.packages || []).some(function (pkg) { return pkg.id === packageId; });
    if (!known) packageId = "";
    var date = todayIso();
    return {
      quoteNumber: newQuoteNumber(date),
      date: date,
      validDays: clampInt(catalog.quoteValidDays, 1, 365, 30),
      clientName: "",
      clientEmail: "",
      agentName: "",
      address: "",
      zip: "",
      sqft: "",
      occupancy: "vacant",
      packageId: packageId,
      qty: qty,
      addons: addons,
      consultationOn: false,
      previouslyPaid: false,
      waiveCredit: false,
      extensionWeeks: 0,
      mediaOn: false,
      mediaWaive: false,
      miles: "",
      discountMode: "amount",
      discountValue: 0,
      notes: "",
      customLines: []
    };
  }

  function packageLineDetail(pkg) {
    var bits = [];
    if (pkg.kind === "occupied") bits.push("Owner's furniture");
    else if (pkg.includedRooms > 0) bits.push(pkg.includedRooms + " " + plural("room", pkg.includedRooms));
    if (pkg.includedDays > 0) bits.push(pkg.includedDays + " days included");
    if (pkg.includesConsultation) bits.push("Consultation is part of this service");
    if (!bits.length && pkg.description) return pkg.description;
    return bits.join(" · ");
  }

  function includedBullets(pkg) {
    var out = [];
    if (pkg.description) out.push(pkg.description);
    if (pkg.kind === "consult") {
      out.push("A walk-through and recommendations. Furniture rental is not included unless a staging package is quoted.");
      return out;
    }
    if (pkg.includedRooms > 0) {
      out.push(pkg.includedRooms + " " + plural("room", pkg.includedRooms) + " included in the package price.");
    }
    if (pkg.piecesPerRoom > 0) {
      out.push("Each of those rooms includes up to " + pkg.piecesPerRoom + " pieces of furniture, plus accessories.");
    }
    if (pkg.mediaIncluded > 0) {
      out.push("A media package valued at " + money(dollarsToCents(pkg.mediaIncluded)) + " is included in the package price.");
    }
    if (pkg.includedMonths > 0) {
      var rental = pkg.includedMonths + " " + plural("month", pkg.includedMonths) + " of rental included";
      if (pkg.includedDays > 0) rental += " (" + pkg.includedDays + " days)";
      rental += ". Time after that is listed on its own line when selected.";
      out.push(rental);
    }
    out.push("Design, packing, delivery, setup, and pickup by an ASPM-certified team.");
    return out;
  }

  function appliesTo(item, packageId) {
    var list = item && item.appliesTo;
    if (!list || !list.length) return true;
    return list.indexOf(packageId) !== -1;
  }

  function unitHint(item, pkg, rooms) {
    if (!item) return "";
    if (!pkg) return "Select a package to price this.";
    if (!appliesTo(item, pkg.id)) return "Not used on this package.";
    if (item.pricing === "percent") {
      var each = percentOfCents(dollarsToCents(pkg.price), clampNum(item.percent, 0, 100, 0));
      return money(each) + " per " + (item.unit || "month") + " · " + trimNum(item.percent) + "% of " + (pkg.name || "the package");
    }
    if (item.pricing === "per-room") {
      var count = rooms || 0;
      return money(dollarsToCents(item.price)) + " per room per " + (item.unit || "month") +
        (count ? " · " + count + " " + plural("room", count) + " on this quote" : "");
    }
    return money(dollarsToCents(item.price)) + " per " + (item.unit || "item");
  }

  function zipKey(value) {
    var digits = String(value || "").replace(/\D/g, "");
    return digits.length >= 5 ? digits.slice(0, 5) : "";
  }

  function zipPoint(zip) {
    var table = window.QuoteZips || {};
    var key = zipKey(zip);
    if (!key) return null;
    var pair = table[key];
    if (!pair || pair.length < 2) return null;
    var lat = Number(pair[0]);
    var lon = Number(pair[1]);
    if (!isFinite(lat) || !isFinite(lon)) return null;
    return { zip: key, lat: lat, lon: lon };
  }

  function haversineMiles(lat1, lon1, lat2, lon2) {
    var radius = 3958.7613;
    var p = Math.PI / 180;
    var dLat = (lat2 - lat1) * p;
    var dLon = (lon2 - lon1) * p;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * p) * Math.cos(lat2 * p) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * radius * Math.asin(Math.min(1, Math.sqrt(h)));
  }

  function distanceSettings(catalog) {
    var seed = {
      originZip: "92054",
      originLabel: "Oceanside, CA",
      freeMiles: 20,
      ratePerMile: 5,
      roadFactor: 1.2
    };
    var item = (catalog && catalog.distance) || seed;
    return {
      originZip: zipKey(item.originZip) || seed.originZip,
      originLabel: item.originLabel || seed.originLabel,
      freeMiles: clampInt(item.freeMiles, 0, 5000, seed.freeMiles),
      ratePerMile: clampNum(item.ratePerMile, 0, 100000, seed.ratePerMile),
      roadFactor: clampNum(item.roadFactor, 1, 3, seed.roadFactor) || seed.roadFactor,
      placeholder: !!item.placeholder
    };
  }

  function mediaSettings(catalog) {
    var seed = { name: "Media package", price: 500, sqftThreshold: 2500, perSqFt: 0.1, description: "" };
    var item = (catalog && catalog.media) || seed;
    return {
      name: item.name || seed.name,
      description: item.description || "",
      price: clampNum(item.price, 0, 10000000, seed.price),
      sqftThreshold: clampInt(item.sqftThreshold, 0, 1000000, seed.sqftThreshold),
      perSqFt: Number(item.perSqFt),
      placeholder: !!item.placeholder
    };
  }

  function mileage(catalog, zip, overrideMiles) {
    var dist = distanceSettings(catalog);
    if (!isFinite(dist.roadFactor) || dist.roadFactor <= 0) dist.roadFactor = 1.2;
    if (!isFinite(mediaSafe(dist.ratePerMile))) dist.ratePerMile = 0;
    var origin = zipPoint(dist.originZip);
    var dest = zipPoint(zip);
    var straight = null;
    var calculated = null;
    if (origin && dest) {
      straight = haversineMiles(origin.lat, origin.lon, dest.lat, dest.lon);
      calculated = Math.round(straight * dist.roadFactor);
    }
    var used = calculated;
    var overridden = false;
    if (overrideMiles != null && String(overrideMiles).trim() !== "") {
      var typed = Math.round(Number(overrideMiles));
      if (isFinite(typed) && typed >= 0 && typed <= 5000) {
        used = typed;
        overridden = true;
      }
    }
    var extra = used == null ? 0 : Math.max(0, used - dist.freeMiles);
    return {
      calculated: calculated,
      straight: straight,
      used: used,
      overridden: overridden,
      extra: extra,
      surcharge: used == null ? 0 : extra * dollarsToCents(dist.ratePerMile),
      known: !!(origin && dest),
      originKnown: !!origin,
      destKnown: !!dest,
      settings: dist
    };
  }

  function mediaSafe(n) {
    return Number(n);
  }

  function sumLines(lines) {
    var total = 0;
    lines.forEach(function (line) { total += line.amount; });
    return total;
  }

  function extensionSettings(catalog) {
    var seed = { weeklyPerRoom: 50, monthlyPerRoom: 200 };
    var item = (catalog && catalog.extension) || seed;
    return {
      weeklyPerRoom: clampNum(item.weeklyPerRoom, 0, 100000, seed.weeklyPerRoom),
      monthlyPerRoom: clampNum(item.monthlyPerRoom, 0, 100000, seed.monthlyPerRoom),
      placeholder: !!item.placeholder
    };
  }

  function consultationSettings(catalog) {
    var seed = {
      name: "Consultation",
      description: "One hour with a general written plan.",
      price: 250,
      hours: 1,
      credit: 250
    };
    var item = (catalog && catalog.consultation) || seed;
    return {
      name: item.name || seed.name,
      description: item.description || seed.description,
      price: clampNum(item.price, 0, 10000000, seed.price),
      hours: clampInt(item.hours, 1, 24, seed.hours),
      credit: clampNum(item.credit, 0, 10000000, seed.credit),
      placeholder: !!item.placeholder
    };
  }

  function extensionRoomCount(pkg, catalog, qtyMap) {
    var added = 0;
    (catalog.quantityItems || []).forEach(function (item) {
      if (!item.extensionRooms || !appliesTo(item, pkg.id)) return;
      added += clampInt(qtyMap[item.id], 0, 99, 0);
    });
    if (pkg.kind === "occupied") return added;
    return clampInt(pkg.includedRooms, 0, 99, 0) + added;
  }

  function stagedRooms(pkg, catalog, qtyMap) {
    if (!pkg) return 0;
    return extensionRoomCount(pkg, catalog, qtyMap);
  }

  function findPackage(catalog, id) {
    var list = (catalog && catalog.packages) || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function pushSection(sections, id, title, lines, notes) {
    if (!lines.length && !(notes && notes.length)) return;
    sections.push({
      id: id,
      title: title,
      lines: lines,
      notes: notes || [],
      subtotal: sumLines(lines)
    });
  }

  function compute(draft, catalog, contact) {
    draft = draft || {};
    catalog = catalog || {};
    var empty = { error: "", model: null, placeholderUsed: false, discountCapped: false };
    if (draft.packageId && !findPackage(catalog, draft.packageId)) {
      empty.error = "missing-package";
      return empty;
    }
    var pkg = draft.packageId ? findPackage(catalog, draft.packageId) : null;
    var consult = consultationSettings(catalog);
    var media = mediaSettings(catalog);
    var ext = extensionSettings(catalog);
    if (!isFinite(media.perSqFt) || media.perSqFt < 0) media.perSqFt = 0;
    var qtyMap = draft.qty || {};
    var sections = [];
    var placeholderUsed = false;
    var extensionVisible = false;

    if (draft.consultationOn) {
      var hours = consult.hours === 1 ? "1 hour" : consult.hours + " hours";
      var cLines = [{
        name: consult.name || "Consultation",
        detail: consult.description || (hours + ". A general written plan."),
        qty: 1,
        amount: dollarsToCents(consult.price)
      }];
      pushSection(sections, "consultation", "Consultation", cLines, []);
      if (consult.placeholder) placeholderUsed = true;
    }

    if (pkg) {
      if (pkg.placeholder) placeholderUsed = true;
      var sLines = [{
        name: pkg.name || "Staging",
        detail: packageLineDetail(pkg),
        qty: 1,
        amount: dollarsToCents(pkg.price)
      }];
      (catalog.quantityItems || []).forEach(function (item) {
        if (!appliesTo(item, pkg.id)) return;
        var qty = clampInt(qtyMap[item.id], 0, 99, 0);
        if (!qty) return;
        var unitCents = dollarsToCents(item.price);
        var amount = unitCents * qty;
        if (!amount) return;
        var unitName = item.unit || "item";
        var detail = qty + " " + plural(unitName, qty) + " × " + money(unitCents);
        if (item.description) detail = item.description + " · " + detail;
        sLines.push({ name: item.name || "Item", detail: detail, qty: qty, amount: amount });
        if (item.placeholder) placeholderUsed = true;
      });
      var addonMap = draft.addons || {};
      (catalog.addons || []).forEach(function (item) {
        if (!addonMap[item.id]) return;
        sLines.push({
          name: item.name || "Add-on",
          detail: item.description || "",
          qty: 1,
          amount: dollarsToCents(item.price)
        });
        if (item.placeholder) placeholderUsed = true;
      });
      var rooms = extensionRoomCount(pkg, catalog, qtyMap);
      var showExtension = pkg.kind === "occupied" ? rooms > 0 : true;
      extensionVisible = showExtension;
      var notes = [];
      if (showExtension) {
        var weekly = dollarsToCents(ext.weeklyPerRoom);
        var monthly = dollarsToCents(ext.monthlyPerRoom);
        var weeks = clampInt(draft.extensionWeeks, 0, 104, 0);
        if (weeks > 0 && rooms > 0 && weekly > 0) {
          sLines.push({
            name: "Extension",
            detail: weeks + " " + plural("week", weeks) + " × " + rooms + " " + plural("room", rooms) + " × " + money(weekly),
            qty: weeks,
            amount: weeks * rooms * weekly
          });
        }
        var rateLine = pkg.kind === "occupied"
          ? "After the included " + (pkg.includedDays || 0) + " days, extensions apply only to rented rooms: " +
            money(monthly) + " per rented room per month, billed in prepaid 1-week blocks at " + money(weekly) + " per room."
          : "After the included " + (pkg.includedDays || 0) + " days: " + money(monthly) +
            " per room per month, billed in prepaid 1-week blocks at " + money(weekly) +
            " per room (" + rooms + " " + plural("room", rooms) + " on this quote).";
        notes.push(rateLine);
        if (ext.placeholder) placeholderUsed = true;
      }
      if (catalog.roomNote) notes.push(catalog.roomNote);
      if (!draft.waiveCredit && (draft.consultationOn || draft.previouslyPaid)) {
        var credit = dollarsToCents(consult.credit);
        if (credit > 0) {
          sLines.push({
            name: "Consultation credit",
            detail: draft.consultationOn ? "Booked on this quote with staging." : "Previously paid.",
            qty: 1,
            amount: -credit
          });
        }
      }
      pushSection(sections, "staging", "Staging", sLines, notes);
    }

    if (draft.mediaOn) {
      var base = dollarsToCents(media.price);
      var mLines = [{
        name: media.name || "Basic Media Package",
        detail: "Homes up to " + Number(media.sqftThreshold).toLocaleString("en-US") + " sq ft.",
        qty: 1,
        amount: base
      }];
      if (draft.mediaWaive) {
        mLines.push({
          name: "Media package waived",
          detail: "The media fee is not charged. The line above shows the value.",
          qty: 1,
          amount: -base
        });
      }
      var sqft = clampInt(draft.sqft, 0, 1000000, 0);
      if (sqft > media.sqftThreshold) {
        var over = sqft - media.sqftThreshold;
        var sizeCents = Math.round(over * media.perSqFt * 100);
        if (sizeCents > 0) {
          mLines.push({
            name: "Media size surcharge",
            detail: over.toLocaleString("en-US") + " sq ft over " +
              Number(media.sqftThreshold).toLocaleString("en-US") + " at " +
              money(Math.round(media.perSqFt * 100)) + " per sq ft",
            qty: 1,
            amount: sizeCents
          });
        }
      }
      pushSection(sections, "media", "Listing media", mLines, []);
      if (media.placeholder) placeholderUsed = true;
    }

    var visit = !!(draft.consultationOn || pkg || draft.mediaOn);
    var trip = mileage(catalog, draft.zip, draft.miles);
    if (visit && trip.surcharge > 0) {
      var mileWord = trip.used === 1 ? "mile" : "miles";
      var fromLabel = trip.settings.originLabel || "Oceanside, CA";
      pushSection(sections, "travel", "Travel", [{
        name: "Travel",
        detail: trip.used + " " + mileWord + (trip.overridden ? " entered" : "") +
          " from " + fromLabel + " (" + trip.settings.originZip + "), " +
          trip.extra + (trip.extra === 1 ? " mile" : " miles") + " over the " +
          trip.settings.freeMiles + " included, at " +
          money(dollarsToCents(trip.settings.ratePerMile)) + " per mile. Charged once per visit.",
        qty: 1,
        amount: trip.surcharge
      }], []);
      if (trip.settings.placeholder) placeholderUsed = true;
    }

    var customLines = [];
    (draft.customLines || []).forEach(function (line) {
      var name = String((line && line.name) || "").trim().slice(0, 80);
      var amount = dollarsToCents(clampNum(line && line.amount, -10000000, 10000000, 0));
      if (!amount) return;
      customLines.push({
        name: name || "Custom item",
        detail: amount < 0 ? "Credit" : "Added for this quote",
        qty: 1,
        amount: amount
      });
    });
    pushSection(sections, "custom", "Additional", customLines, []);

    var subtotal = 0;
    sections.forEach(function (section) { subtotal += section.subtotal; });
    var mode = draft.discountMode === "percent" ? "percent" : "amount";
    var discountValue = clampNum(draft.discountValue, 0, mode === "percent" ? 100 : 10000000, 0);
    var discount = 0;
    var discountLabel = "";
    var discountCapped = false;
    if (discountValue > 0 && subtotal > 0) {
      if (mode === "percent") {
        discount = percentOfCents(subtotal, discountValue);
        discountLabel = "Discount (" + trimNum(discountValue) + "%)";
      } else {
        discount = dollarsToCents(discountValue);
        discountLabel = "Discount";
      }
      if (discount > subtotal) {
        discount = subtotal;
        discountCapped = true;
      }
    }

    var included = [];
    if (draft.consultationOn) {
      included.push((consult.hours === 1 ? "One hour" : consult.hours + " hours") + " with a general written plan.");
    }
    if (pkg) {
      if (pkg.description) included.push(pkg.description);
      if (pkg.includedRooms > 0) {
        included.push(pkg.includedRooms + " " + plural("room", pkg.includedRooms) + " included.");
      }
      if (pkg.includedDays > 0) included.push(pkg.includedDays + " days included.");
      if (pkg.includesConsultation) included.push("Consultation is part of this staging service.");
    }
    if (draft.mediaOn) included.push("Listing media is priced in its own section.");

    var terms = !pkg
      ? (draft.mediaOn && !draft.consultationOn ? (catalog.mediaTerms || []) : (catalog.consultationTerms || []))
      : (catalog.terms || []).filter(function (term) {
        if (extensionVisible) return true;
        return !/week|month|rental|extension/i.test(term);
      });
    var flat = [];
    sections.forEach(function (section) {
      section.lines.forEach(function (line) { flat.push(line); });
    });
    var issued = parseIso(draft.date) ? String(draft.date) : todayIso();
    var validDays = clampInt(draft.validDays, 1, 365, clampInt(catalog.quoteValidDays, 1, 365, 30));
    var who = contactBlock(contact);
    var number = String(draft.quoteNumber || "").trim().slice(0, 40) || newQuoteNumber(issued);
    if (!visit && !customLines.length) {
      empty.error = "empty";
      empty.model = null;
      return empty;
    }
    return {
      error: "",
      placeholderUsed: placeholderUsed,
      discountCapped: discountCapped,
      model: {
        number: number,
        documentTitle: pkg ? "Staging Quote" : "Quote",
        issued: issued,
        until: addDaysIso(issued, validDays),
        client: String(draft.clientName || "").trim().slice(0, 80),
        email: String(draft.clientEmail || "").trim().slice(0, 120),
        agent: String(draft.agentName || "").trim().slice(0, 80),
        address: String(draft.address || "").trim().slice(0, 180),
        zip: zipKey(draft.zip),
        sqft: clampInt(draft.sqft, 0, 1000000, 0),
        miles: visit ? trip.used : null,
        originLabel: trip.settings.originLabel,
        occupancy: draft.occupancy === "occupied" ? "occupied" : "vacant",
        sections: sections,
        lines: flat,
        subtotal: subtotal,
        discountLabel: discountLabel,
        discount: discount,
        total: subtotal - discount,
        included: included,
        terms: (terms || []).map(function (term) { return String(term || "").trim(); }).filter(Boolean).slice(0, 12),
        notes: String(draft.notes || "").trim().slice(0, 800),
        business: who.business,
        phone: who.phone,
        phoneTel: who.phoneTel,
        mail: who.email,
        tagline: who.tagline
      }
    };
  }

  function pack(model) {
    var packed = {
      v: 1,
      dt: model.documentTitle,
      n: model.number,
      d: model.issued,
      u: model.until,
      c: model.client,
      e: model.email,
      g: model.agent,
      a: model.address,
      zp: model.zip,
      sf: model.sqft || "",
      mi: model.miles,
      ol: model.originLabel,
      o: model.occupancy === "occupied" ? "o" : "v",
      L: (model.lines || []).map(function (line) {
        return [line.name, line.detail, line.qty, line.amount];
      }),
      S: (model.sections || []).map(function (section) {
        return {
          t: section.title,
          u: section.subtotal,
          n: section.notes || [],
          L: (section.lines || []).map(function (line) {
            return [line.name, line.detail, line.qty, line.amount];
          })
        };
      }),
      s: model.subtotal,
      dl: model.discountLabel,
      da: model.discount,
      t: model.total,
      i: model.included,
      m: model.terms,
      z: model.notes,
      b: model.business,
      p: model.phone,
      pt: model.phoneTel,
      mb: model.mail,
      tg: model.tagline
    };
    var out = {};
    Object.keys(packed).forEach(function (key) {
      var value = packed[key];
      if (value == null || value === "") return;
      if (Array.isArray(value) && !value.length) return;
      if ((key === "da" || key === "dl") && !value) return;
      if (key === "mi" && value == null) return;
      if (key === "sf" && !value) return;
      out[key] = value;
    });
    return out;
  }

  function unpack(raw) {
    if (!raw || raw.v !== 1 || !Array.isArray(raw.L)) return null;
    var lines = [];
    for (var i = 0; i < raw.L.length; i++) {
      var row = raw.L[i];
      if (!Array.isArray(row) || row.length < 4) return null;
      var qty = Number(row[2]);
      var amount = Number(row[3]);
      if (!isFinite(qty) || !isFinite(amount)) return null;
      lines.push({
        name: String(row[0] || "").slice(0, 120),
        detail: String(row[1] || "").slice(0, 500),
        qty: qty,
        amount: Math.round(amount)
      });
    }
    function text(key, max, fallback) {
      var value = String(raw[key] || "").slice(0, max);
      return value || fallback || "";
    }
    function list(key, maxItems, maxLen) {
      if (!Array.isArray(raw[key])) return [];
      var items = [];
      raw[key].forEach(function (item) {
        var value = String(item || "").trim().slice(0, maxLen);
        if (value && items.length < maxItems) items.push(value);
      });
      return items;
    }
    var sections = [];
    if (Array.isArray(raw.S)) {
      raw.S.forEach(function (section) {
        if (!section || !Array.isArray(section.L)) return;
        var sectionLines = [];
        section.L.forEach(function (row) {
          if (!Array.isArray(row) || row.length < 4) return;
          sectionLines.push({
            name: String(row[0] || "").slice(0, 120),
            detail: String(row[1] || "").slice(0, 500),
            qty: Number(row[2]),
            amount: Math.round(Number(row[3]))
          });
        });
        var notes = [];
        if (Array.isArray(section.n)) {
          section.n.forEach(function (note) {
            var value = String(note || "").trim().slice(0, 500);
            if (value && notes.length < 6) notes.push(value);
          });
        }
        sections.push({
          title: String(section.t || "Section").slice(0, 80),
          subtotal: Math.round(Number(section.u) || 0),
          notes: notes,
          lines: sectionLines
        });
      });
    }
    return {
      documentTitle: text("dt", 40, "Quote"),
      number: text("n", 40, "Quote"),
      issued: text("d", 10),
      until: text("u", 10),
      client: text("c", 80),
      email: text("e", 120),
      agent: text("g", 80),
      address: text("a", 180),
      zip: text("zp", 5),
      sqft: raw.sf ? Math.round(Number(raw.sf)) || 0 : 0,
      miles: raw.mi == null || raw.mi === "" ? null : Math.round(Number(raw.mi)),
      originLabel: text("ol", 80),
      occupancy: raw.o === "o" ? "occupied" : "vacant",
      sections: sections,
      lines: lines,
      subtotal: Math.round(Number(raw.s) || 0),
      discountLabel: text("dl", 40),
      discount: Math.round(Number(raw.da) || 0),
      total: Math.round(Number(raw.t) || 0),
      included: list("i", 12, 300),
      terms: list("m", 12, 500),
      notes: text("z", 800),
      business: text("b", 80, FALLBACK.business),
      phone: text("p", 40, FALLBACK.phone),
      phoneTel: text("pt", 20, FALLBACK.phoneTel),
      mail: text("mb", 80, FALLBACK.email),
      tagline: text("tg", 80, FALLBACK.tagline)
    };
  }

  function bytesToB64url(bytes) {
    var bin = "";
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function b64urlToBytes(text) {
    var s = String(text || "").replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) s += "=";
    var bin = atob(s);
    var out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  async function deflateRaw(bytes) {
    if (typeof CompressionStream !== "function") return null;
    var stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream("deflate-raw"));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }

  async function inflateRaw(bytes) {
    if (typeof DecompressionStream !== "function") return null;
    var stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
    var out = new Uint8Array(await new Response(stream).arrayBuffer());
    if (out.length > 100000) return null;
    return out;
  }

  async function encodeHash(model) {
    var json = JSON.stringify(pack(model));
    var raw = new TextEncoder().encode(json);
    var plain = "j" + bytesToB64url(raw);
    try {
      var packed = await deflateRaw(raw);
      if (packed && packed.length) {
        var zipped = "z" + bytesToB64url(packed);
        if (zipped.length < plain.length) return zipped;
      }
    } catch (e) {}
    return plain;
  }

  async function decodeHash(hash) {
    try {
      var body = String(hash || "").trim();
      if (body.charAt(0) === "#") body = body.slice(1);
      try { body = decodeURIComponent(body); } catch (e) {}
      if (!body) return null;
      var kind = body.charAt(0);
      var data = b64urlToBytes(body.slice(1));
      var bytes = data;
      if (kind === "z") {
        bytes = await inflateRaw(data);
        if (!bytes) return null;
      } else if (kind !== "j") {
        return null;
      }
      if (!bytes || bytes.length > 100000) return null;
      return unpack(JSON.parse(new TextDecoder().decode(bytes)));
    } catch (e) {
      return null;
    }
  }

  function el(tag, props) {
    var node = document.createElement(tag);
    var children = [];
    if (props) {
      Object.keys(props).forEach(function (key) {
        var value = props[key];
        if (key === "class") node.className = value;
        else if (key === "text") node.textContent = value == null ? "" : String(value);
        else if (key === "children") children = value || [];
        else if (value != null && value !== false) node.setAttribute(key, value === true ? "" : String(value));
      });
    }
    children.forEach(function (child) {
      if (child != null) node.appendChild(child);
    });
    return node;
  }

  function renderPaper(model, opts) {
    opts = opts || {};
    if (!model) return el("p", { text: "No quote to show." });
    var paper = el("article", { class: "paper", id: "quote-paper" });
    var top = el("header", { class: "paper-top" });
    if (opts.logo) {
      top.appendChild(el("img", {
        class: "paper-logo",
        src: opts.logo,
        alt: model.business || "Staged4Sale",
        width: "155",
        height: "72"
      }));
    }
    var heading = opts.heading === "h1" ? "h1" : "p";
    top.appendChild(el("div", {
      class: "paper-id",
      children: [
        el(heading, { class: "paper-kicker", text: model.documentTitle || "Quote" }),
        el("p", { class: "paper-number", text: "No. " + (model.number || "Quote") })
      ]
    }));
    paper.appendChild(top);

    var meta = el("div", { class: "paper-meta" });
    var clientBits = [el("p", { class: "paper-label", text: "Prepared for" })];
    clientBits.push(el("p", { class: "paper-strong", text: model.client || "—" }));
    if (model.email) clientBits.push(el("p", { text: model.email }));
    if (model.agent) clientBits.push(el("p", { text: "Agent · " + model.agent }));
    meta.appendChild(el("div", { children: clientBits }));
    meta.appendChild(el("div", {
      class: "paper-dates",
      children: [
        el("p", { class: "paper-label", text: "Quote date" }),
        el("p", { class: "paper-strong", text: formatLong(model.issued) }),
        el("p", { class: "paper-label paper-label-gap", text: "Valid through" }),
        el("p", { text: formatLong(model.until) })
      ]
    }));

    var placeBits = [el("p", { class: "paper-label", text: "Property" })];
    if (model.address) placeBits.push(el("p", { class: "paper-strong", text: model.address }));
    var placeFacts = [];
    if (model.zip) placeFacts.push("ZIP " + model.zip);
    if (model.sqft) placeFacts.push(Number(model.sqft).toLocaleString("en-US") + " sq ft");
    if ((model.address || model.zip) && (model.occupancy === "occupied" || model.occupancy === "vacant")) {
      placeFacts.push(model.occupancy === "occupied" ? "Occupied" : "Vacant");
    }
    if (placeFacts.length) placeBits.push(el("p", { text: placeFacts.join(" · ") }));
    if (model.miles != null && isFinite(Number(model.miles))) {
      placeBits.push(el("p", {
        text: model.miles + (Number(model.miles) === 1 ? " mile from " : " miles from ") +
          (model.originLabel || "Oceanside, CA")
      }));
    }
    if (placeBits.length > 1) meta.appendChild(el("div", { class: "paper-property", children: placeBits }));
    paper.appendChild(meta);

    if (model.sections && model.sections.length) {
      model.sections.forEach(function (part) {
        paper.appendChild(renderQuoteSection(part));
      });
    } else {
      var lines = el("div", { class: "paper-lines" });
      (model.lines || []).forEach(function (line) {
        lines.appendChild(renderQuoteLine(line));
      });
      paper.appendChild(lines);
    }

    var totals = el("div", { class: "paper-totals" });
    totals.appendChild(totalRow("Subtotal", money(model.subtotal), false));
    if (model.discount) {
      totals.appendChild(totalRow(model.discountLabel || "Discount", "−" + money(model.discount), false));
    }
    var grand = totalRow("Total", money(model.total), true);
    grand.setAttribute("data-total", String(model.total));
    totals.appendChild(grand);
    paper.appendChild(totals);

    if (model.included && model.included.length) {
      paper.appendChild(section("What's included", "ul", "paper-included", model.included));
    }
    if (model.notes) {
      var notes = el("section", { class: "paper-block" });
      notes.appendChild(el("h2", { text: "Notes" }));
      notes.appendChild(el("p", { class: "paper-notes", text: model.notes }));
      paper.appendChild(notes);
    }
    if (model.terms && model.terms.length) {
      paper.appendChild(section("Terms", "ol", "paper-terms", model.terms));
    }

    var contact = el("p", { class: "paper-contact" });
    if (model.phone) {
      contact.appendChild(el("a", { href: "tel:" + (model.phoneTel || ""), text: model.phone }));
    }
    if (model.mail) {
      if (contact.childNodes.length) contact.appendChild(document.createTextNode(" · "));
      contact.appendChild(el("a", { href: "mailto:" + model.mail, text: model.mail }));
    }
    paper.appendChild(el("footer", {
      class: "paper-foot",
      children: [
        el("p", { class: "paper-biz", text: model.business || FALLBACK.business }),
        model.tagline ? el("p", { class: "paper-tag", text: model.tagline }) : null,
        contact,
        el("p", { class: "paper-sign", text: "No commitment until the agreement is signed." })
      ]
    }));
    return paper;
  }

  function renderQuoteLine(line) {
    var copy = [el("p", { class: "paper-line-name", text: line.name || "Item" })];
    if (line.detail) copy.push(el("p", { class: "paper-line-detail", text: line.detail }));
    return el("div", {
      class: "paper-line",
      children: [
        el("div", { children: copy }),
        el("p", { class: "paper-line-amt", text: money(line.amount) })
      ]
    });
  }

  function renderQuoteSection(part) {
    var block = el("section", { class: "paper-section" });
    block.appendChild(el("h2", { text: part.title || "Section" }));
    (part.lines || []).forEach(function (line) {
      block.appendChild(renderQuoteLine(line));
    });
    (part.notes || []).forEach(function (note) {
      block.appendChild(el("p", { class: "paper-section-note", text: note }));
    });
    block.appendChild(el("div", {
      class: "paper-subtotal",
      children: [
        el("span", { text: (part.title || "Section") + " subtotal" }),
        el("span", { text: money(part.subtotal) })
      ]
    }));
    return block;
  }

  function totalRow(label, value, grand) {
    return el("div", {
      class: grand ? "paper-total-row paper-grand" : "paper-total-row",
      children: [
        el("span", { text: label }),
        el(grand ? "strong" : "span", { text: value })
      ]
    });
  }

  function section(title, tag, className, items) {
    var list = el(tag, { class: className });
    items.forEach(function (item) {
      list.appendChild(el("li", { text: item }));
    });
    return el("section", {
      class: "paper-block",
      children: [el("h2", { text: title }), list]
    });
  }

  window.QuoteEngine = {
    money: money,
    moneyShort: moneyShort,
    todayIso: todayIso,
    addDaysIso: addDaysIso,
    formatLong: formatLong,
    newQuoteNumber: newQuoteNumber,
    blankDraft: blankDraft,
    unitHint: unitHint,
    mileage: mileage,
    stagedRooms: stagedRooms,
    compute: compute,
    encodeHash: encodeHash,
    decodeHash: decodeHash,
    renderPaper: renderPaper
  };
})();

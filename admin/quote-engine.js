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
    if (!known) packageId = (catalog.packages && catalog.packages[0] && catalog.packages[0].id) || "";
    var date = todayIso();
    return {
      quoteNumber: newQuoteNumber(date),
      date: date,
      validDays: clampInt(catalog.quoteValidDays, 1, 365, 30),
      clientName: "",
      clientEmail: "",
      agentName: "",
      address: "",
      occupancy: "vacant",
      packageId: packageId,
      qty: qty,
      addons: addons,
      discountMode: "amount",
      discountValue: 0,
      notes: "",
      customLines: []
    };
  }

  function packageLineDetail(pkg) {
    if (pkg.kind === "consult") return pkg.description || "Consultation";
    var bits = [];
    if (!pkg.includedRooms && pkg.description) bits.push(String(pkg.description).replace(/\.$/, ""));
    if (pkg.includedRooms > 0) bits.push(pkg.includedRooms + " " + plural("room", pkg.includedRooms) + " included");
    if (pkg.piecesPerRoom > 0) bits.push("Up to " + pkg.piecesPerRoom + " furniture pieces per room, plus accessories");
    if (pkg.mediaIncluded > 0) bits.push("Media package included (" + moneyShort(dollarsToCents(pkg.mediaIncluded)) + ")");
    if (pkg.includedMonths > 0) {
      bits.push(pkg.includedMonths + " " + plural("month", pkg.includedMonths) + " of rental included");
    }
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
      out.push(pkg.includedMonths + " " + plural("month", pkg.includedMonths) + " of rental included. Months after that are listed on their own line when selected.");
    }
    out.push("Design, packing, delivery, setup, and pickup by an ASPM-certified team.");
    return out;
  }

  function unitHint(item, pkg) {
    if (!item) return "";
    if (!pkg) return "Select a package to price this.";
    if (item.pricing === "percent") {
      var each = percentOfCents(dollarsToCents(pkg.price), clampNum(item.percent, 0, 100, 0));
      return money(each) + " per " + (item.unit || "month") + " · " + trimNum(item.percent) + "% of " + (pkg.name || "the package");
    }
    return money(dollarsToCents(item.price)) + " per " + (item.unit || "item");
  }

  function findPackage(catalog, id) {
    var list = (catalog && catalog.packages) || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function compute(draft, catalog, contact) {
    draft = draft || {};
    catalog = catalog || {};
    var empty = {
      error: "no-package",
      model: null,
      placeholderUsed: false,
      discountCapped: false
    };
    if (!draft.packageId) return empty;
    var pkg = findPackage(catalog, draft.packageId);
    if (!pkg) {
      empty.error = "missing-package";
      return empty;
    }

    var lines = [];
    var placeholderUsed = !!pkg.placeholder;
    lines.push({
      name: pkg.name || "Package",
      detail: packageLineDetail(pkg),
      qty: 1,
      amount: dollarsToCents(pkg.price)
    });

    var qtyMap = draft.qty || {};
    (catalog.quantityItems || []).forEach(function (item) {
      var qty = clampInt(qtyMap[item.id], 0, 99, 0);
      if (!qty) return;
      var unitCents = item.pricing === "percent"
        ? percentOfCents(dollarsToCents(pkg.price), clampNum(item.percent, 0, 100, 0))
        : dollarsToCents(item.price);
      var unitName = item.unit || (item.pricing === "percent" ? "month" : "item");
      var math = qty + " " + plural(unitName, qty) + " × " + money(unitCents);
      var detail = math;
      if (item.pricing === "percent") {
        detail += " (" + trimNum(item.percent) + "% of " + (pkg.name || "the package") + ")";
      } else if (item.unit === "room" && pkg.piecesPerRoom > 0) {
        var roomLead = item.description ? String(item.description).replace(/\.\s*$/, "") + ", with up to " : "Up to ";
        detail = roomLead + pkg.piecesPerRoom + " furniture pieces, plus accessories · " + math;
      } else if (item.description) {
        detail = item.description + " · " + math;
      }
      lines.push({
        name: item.name || "Item",
        detail: detail,
        qty: qty,
        amount: unitCents * qty
      });
      if (item.placeholder) placeholderUsed = true;
    });

    var addonMap = draft.addons || {};
    (catalog.addons || []).forEach(function (item) {
      if (!addonMap[item.id]) return;
      lines.push({
        name: item.name || "Add-on",
        detail: item.description || "",
        qty: 1,
        amount: dollarsToCents(item.price)
      });
      if (item.placeholder) placeholderUsed = true;
    });

    (draft.customLines || []).forEach(function (line) {
      var name = String((line && line.name) || "").trim().slice(0, 80);
      var amount = dollarsToCents(clampNum(line && line.amount, -10000000, 10000000, 0));
      if (!amount) return;
      lines.push({
        name: name || "Custom item",
        detail: amount < 0 ? "Credit" : "Added for this quote",
        qty: 1,
        amount: amount
      });
    });

    var subtotal = 0;
    lines.forEach(function (line) { subtotal += line.amount; });

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

    var issued = parseIso(draft.date) ? String(draft.date) : todayIso();
    var validDays = clampInt(
      draft.validDays,
      1,
      365,
      clampInt(catalog.quoteValidDays, 1, 365, 30)
    );
    var who = contactBlock(contact);
    var number = String(draft.quoteNumber || "").trim().slice(0, 40) || newQuoteNumber(issued);

    return {
      error: "",
      placeholderUsed: placeholderUsed,
      discountCapped: discountCapped,
      model: {
        number: number,
        issued: issued,
        until: addDaysIso(issued, validDays),
        client: String(draft.clientName || "").trim().slice(0, 80),
        email: String(draft.clientEmail || "").trim().slice(0, 120),
        agent: String(draft.agentName || "").trim().slice(0, 80),
        address: String(draft.address || "").trim().slice(0, 180),
        occupancy: draft.occupancy === "occupied" ? "occupied" : "vacant",
        lines: lines,
        subtotal: subtotal,
        discountLabel: discountLabel,
        discount: discount,
        total: subtotal - discount,
        included: includedBullets(pkg),
        terms: (catalog.terms || []).map(function (term) {
          return String(term || "").trim();
        }).filter(Boolean).slice(0, 12),
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
      n: model.number,
      d: model.issued,
      u: model.until,
      c: model.client,
      e: model.email,
      g: model.agent,
      a: model.address,
      o: model.occupancy === "occupied" ? "o" : "v",
      L: (model.lines || []).map(function (line) {
        return [line.name, line.detail, line.qty, line.amount];
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
    return {
      number: text("n", 40, "Quote"),
      issued: text("d", 10),
      until: text("u", 10),
      client: text("c", 80),
      email: text("e", 120),
      agent: text("g", 80),
      address: text("a", 180),
      occupancy: raw.o === "o" ? "occupied" : "vacant",
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
        el(heading, { class: "paper-kicker", text: "Staging Quote" }),
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

    var placeBits = [
      el("p", { class: "paper-label", text: "Property" }),
      el("p", { class: "paper-strong", text: model.address || "—" })
    ];
    if (model.occupancy === "occupied" || model.occupancy === "vacant") {
      placeBits.push(el("p", { text: model.occupancy === "occupied" ? "Occupied" : "Vacant" }));
    }
    meta.appendChild(el("div", { class: "paper-property", children: placeBits }));
    paper.appendChild(meta);

    var lines = el("div", { class: "paper-lines" });
    (model.lines || []).forEach(function (line) {
      var copy = [el("p", { class: "paper-line-name", text: line.name || "Item" })];
      if (line.detail) copy.push(el("p", { class: "paper-line-detail", text: line.detail }));
      lines.appendChild(el("div", {
        class: "paper-line",
        children: [
          el("div", { children: copy }),
          el("p", { class: "paper-line-amt", text: money(line.amount) })
        ]
      }));
    });
    paper.appendChild(lines);

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
    compute: compute,
    encodeHash: encodeHash,
    decodeHash: decodeHash,
    renderPaper: renderPaper
  };
})();

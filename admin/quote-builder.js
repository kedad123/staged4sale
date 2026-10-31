/* Quote builder. Prices come from quote-catalog.js. The sheet and
   the math come from quote-engine.js. Saved quotes stay in this browser. */
(function () {
  var SAVE_KEY = "s4s-admin-saved-quotes-v1";
  var brand = window.AdminBrand || {};
  var catalog = window.QuoteCatalog.load();
  var engine = window.QuoteEngine;
  var draft = engine.blankDraft(catalog);
  var currentSaveId = "";
  var dirty = false;
  var silent = false;
  var emailTouched = false;
  var main = document.getElementById("main");

  document.title = "Quote builder · " + (brand.businessName || "Staged4Sale");

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
      if (child == null) return;
      node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
    });
    return node;
  }

  function icon(name) {
    return el("i", { class: "fa-solid " + name, "aria-hidden": "true" });
  }

  function field(label, control, span) {
    return el("label", {
      class: span ? "field qt-span" : "field",
      children: [el("span", { text: label }), control]
    });
  }

  function input(attrs) {
    return el("input", attrs);
  }

  function clients() {
    return (window.AdminSample && window.AdminSample.clients) || [];
  }

  function contact() {
    var info = brand.contact || {};
    return {
      business: brand.businessName,
      phone: info.phoneDisplay,
      phoneTel: info.phoneTel,
      email: info.email,
      tagline: brand.tagline
    };
  }

  function packageById(id) {
    var list = catalog.packages || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function packageBlurb(pkg) {
    if (!pkg) return "";
    if (pkg.kind === "consult") return pkg.description || "";
    var bits = [];
    if (pkg.includedRooms) bits.push(pkg.includedRooms + (pkg.includedRooms === 1 ? " room" : " rooms"));
    if (pkg.includedMonths) bits.push(pkg.includedMonths + (pkg.includedMonths === 1 ? " month" : " months") + " of rental included");
    if (pkg.mediaIncluded) bits.push("media package included");
    if (pkg.piecesPerRoom) bits.push("up to " + pkg.piecesPerRoom + " pieces per room");
    return bits.join(" · ");
  }

  function markDirty() {
    if (!silent) dirty = true;
  }

  function setStatus(text) {
    var node = document.getElementById("qt-status");
    if (node) node.textContent = text || "";
  }

  function readSaves() {
    try {
      var list = JSON.parse(localStorage.getItem(SAVE_KEY) || "[]");
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function writeSaves(list) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(list.slice(0, 40)));
      return true;
    } catch (e) {
      return false;
    }
  }

  function customId() {
    return "c-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function readCustomLines() {
    var rows = [];
    document.querySelectorAll("[data-custom-row]").forEach(function (row) {
      var name = row.querySelector("[data-custom='name']");
      var amount = row.querySelector("[data-custom='amount']");
      rows.push({
        id: row.getAttribute("data-custom-row"),
        name: name ? name.value : "",
        amount: amount ? amount.value : ""
      });
    });
    draft.customLines = rows;
  }

  function refresh() {
    readCustomLines();
    var result = engine.compute(draft, catalog, contact());
    var total = document.getElementById("running-total");
    var warn = document.getElementById("placeholder-warn");
    var cap = document.getElementById("cap-note");
    var slot = document.getElementById("quote-slot");
    if (total) {
      total.textContent = result.model ? engine.money(result.model.total) : "$0.00";
      total.setAttribute("data-total", result.model ? String(result.model.total) : "");
    }
    if (warn) warn.hidden = !result.placeholderUsed;
    if (cap) cap.hidden = !result.discountCapped;
    if (!slot) return;
    if (!result.model) {
      var message = result.error === "missing-package"
        ? "That package is no longer on the price list. Choose another to rebuild the total."
        : "Add a package on the price list to build a quote.";
      slot.replaceChildren(el("p", { class: "card", text: message }));
      return;
    }
    if (!draft.quoteNumber) {
      draft.quoteNumber = result.model.number;
      var numberInput = document.getElementById("quote-number");
      if (numberInput && !numberInput.value.trim()) numberInput.value = result.model.number;
    }
    slot.replaceChildren(engine.renderPaper(result.model, { logo: "../images/logo2.png" }));
    var pkg = packageById(draft.packageId);
    document.querySelectorAll("[data-hint-for]").forEach(function (node) {
      var id = node.getAttribute("data-hint-for");
      var item = null;
      (catalog.quantityItems || []).forEach(function (entry) {
        if (entry.id === id) item = entry;
      });
      node.textContent = engine.unitHint(item, pkg);
    });
    document.title = "Quote " + result.model.number + " · " + (brand.businessName || "Staged4Sale");
  }

  function fillForm() {
    silent = true;
    emailTouched = false;
    setValue("quote-number", draft.quoteNumber);
    setValue("quote-date", draft.date);
    setValue("valid-days", draft.validDays);
    setValue("client-name", draft.clientName);
    setValue("client-email", draft.clientEmail);
    setValue("agent-name", draft.agentName);
    setValue("address", draft.address);
    setValue("discount-value", draft.discountValue);
    setValue("notes", draft.notes);
    var mode = document.getElementById("discount-mode");
    if (mode) mode.value = draft.discountMode === "percent" ? "percent" : "amount";
    document.querySelectorAll("input[name='occupancy']").forEach(function (node) {
      node.checked = node.value === draft.occupancy;
    });
    document.querySelectorAll("input[name='packageId']").forEach(function (node) {
      node.checked = node.value === draft.packageId;
    });
    (catalog.quantityItems || []).forEach(function (item) {
      setValue("qty-" + item.id, draft.qty[item.id] || 0);
    });
    (catalog.addons || []).forEach(function (item) {
      var node = document.getElementById("addon-" + item.id);
      if (node) node.checked = !!draft.addons[item.id];
    });
    renderCustomLines();
    var linkWrap = document.getElementById("link-field");
    if (linkWrap) linkWrap.hidden = true;
    silent = false;
    refresh();
    renderSaved();
  }

  function setValue(id, value) {
    var node = document.getElementById(id);
    if (node) node.value = value == null ? "" : String(value);
  }

  function renderCustomLines() {
    var host = document.getElementById("custom-lines");
    if (!host) return;
    host.replaceChildren();
    (draft.customLines || []).forEach(function (line) {
      host.appendChild(customRow(line));
    });
  }

  function customRow(line) {
    var name = input({
      "data-custom": "name",
      type: "text",
      maxlength: "80",
      value: line.name || "",
      placeholder: "Artwork install"
    });
    var amount = input({
      "data-custom": "amount",
      type: "text",
      inputmode: "decimal",
      value: line.amount == null ? "" : String(line.amount),
      placeholder: "150 or -50"
    });
    var remove = el("button", { class: "btn btn-small btn-ghost", type: "button", text: "Remove" });
    remove.addEventListener("click", function () {
      markDirty();
      var row = remove.closest("[data-custom-row]");
      if (row) row.remove();
      refresh();
    });
    return el("div", {
      class: "qt-custom",
      "data-custom-row": line.id || customId(),
      children: [field("Description", name), field("Amount", amount), remove]
    });
  }

  function renderSaved() {
    var host = document.getElementById("saved-list");
    if (!host) return;
    var list = readSaves();
    host.replaceChildren();
    if (!list.length) {
      host.appendChild(el("p", { class: "fine", text: "No quotes saved in this browser yet." }));
      return;
    }
    list.forEach(function (item) {
      var when = "";
      if (item.savedAt) {
        var date = new Date(item.savedAt);
        if (!isNaN(date.getTime())) {
          when = new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
          }).format(date);
        }
      }
      var open = el("button", { class: "btn btn-small", type: "button", text: "Open" });
      var remove = el("button", { class: "btn btn-small btn-ghost", type: "button", text: "Delete" });
      open.addEventListener("click", function () { openSaved(item.id); });
      remove.addEventListener("click", function () { deleteSaved(item.id); });
      var copy = el("div", { children: [
        el("p", { text: (item.clientName || "Untitled quote") + (item.quoteNumber ? " · " + item.quoteNumber : "") }),
        el("p", { class: "fine", text: [item.address, engine.money(item.total || 0), when].filter(Boolean).join(" · ") })
      ]});
      host.appendChild(el("div", {
        class: "qt-saved-row",
        children: [copy, el("div", { class: "qt-saved-actions", children: [open, remove] })]
      }));
    });
  }

  function openSaved(id) {
    if (dirty && !window.confirm("Open that saved quote? Unsaved changes on this page will be cleared.")) return;
    var found = null;
    readSaves().forEach(function (item) {
      if (item.id === id) found = item;
    });
    if (!found || !found.draft) return;
    draft = JSON.parse(JSON.stringify(found.draft));
    currentSaveId = found.id;
    dirty = false;
    fillForm();
    setStatus("Opened. Totals use the price list currently saved in this browser.");
    window.scrollTo(0, 0);
  }

  function deleteSaved(id) {
    if (!window.confirm("Delete this saved quote from this browser?")) return;
    var list = readSaves().filter(function (item) { return item.id !== id; });
    writeSaves(list);
    if (currentSaveId === id) currentSaveId = "";
    renderSaved();
    setStatus("Removed from this browser.");
  }

  function saveQuote() {
    readCustomLines();
    var result = engine.compute(draft, catalog, contact());
    if (!result.model) {
      setStatus("Choose a package before saving.");
      return;
    }
    if (!currentSaveId) currentSaveId = "sv-" + Date.now().toString(36);
    var record = {
      id: currentSaveId,
      savedAt: new Date().toISOString(),
      quoteNumber: result.model.number,
      clientName: result.model.client,
      address: result.model.address,
      total: result.model.total,
      draft: draft
    };
    var list = readSaves().filter(function (item) { return item.id !== currentSaveId; });
    list.unshift(record);
    if (!writeSaves(list)) {
      setStatus("Could not save in this browser.");
      return;
    }
    dirty = false;
    renderSaved();
    setStatus("Saved in this browser.");
  }

  function newQuote() {
    if (dirty && !window.confirm("Start a new quote? Unsaved changes on this page will be cleared.")) return;
    catalog = window.QuoteCatalog.load();
    draft = engine.blankDraft(catalog);
    currentSaveId = "";
    dirty = false;
    fillForm();
    setStatus("New quote.");
  }

  function viewUrl(hash) {
    var path = location.pathname;
    var root = path.replace(/\/admin\/[^/]+$/, "");
    if (root === path) root = path.replace(/\/quote\/?$/, "");
    if (root.charAt(root.length - 1) === "/") root = root.slice(0, -1);
    return location.origin + root + "/quote/#" + hash;
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      area.remove();
      if (ok) resolve();
      else reject(new Error("copy failed"));
    });
  }

  function copyLink() {
    var result = engine.compute(draft, catalog, contact());
    if (!result.model) {
      setStatus("Choose a package before copying a link.");
      return;
    }
    setStatus("Making the link…");
    engine.encodeHash(result.model).then(function (hash) {
      if (!hash || hash.length > 8000) {
        setStatus("That quote is too long for a link. Shorten the notes and try again.");
        return;
      }
      var url = viewUrl(hash);
      var wrap = document.getElementById("link-field");
      var box = document.getElementById("share-url");
      if (wrap) wrap.hidden = false;
      if (box) box.value = url;
      copyText(url).then(function () {
        setStatus("Link copied (" + url.length + " characters). The quote is in the link, not on a server.");
      }).catch(function () {
        if (box) box.focus();
        setStatus("Copy the link below. It could not be put on the clipboard automatically.");
      });
    }).catch(function () {
      setStatus("The link could not be made.");
    });
  }

  function downloadPdf() {
    var result = engine.compute(draft, catalog, contact());
    if (!result.model) {
      setStatus("Choose a package before downloading.");
      return;
    }
    document.title = "Staging Quote " + result.model.number;
    window.print();
  }

  function onField(event) {
    var target = event.target;
    if (target.hasAttribute("data-custom")) {
      markDirty();
      refresh();
      return;
    }
    var key = target.getAttribute("data-draft");
    if (!key) return;
    markDirty();
    if (key === "clientEmail") emailTouched = true;
    if (target.type === "checkbox" && key.indexOf("addon:") === 0) {
      draft.addons[key.slice(6)] = target.checked;
    } else if (key.indexOf("qty:") === 0) {
      draft.qty[key.slice(4)] = target.value;
    } else if (key === "occupancy" || key === "packageId") {
      if (target.checked) draft[key] = target.value;
    } else {
      draft[key] = target.value;
    }
    if (key === "clientName" && !emailTouched) {
      var typed = target.value.trim();
      clients().forEach(function (person) {
        if (person.name === typed) {
          draft.clientEmail = person.email || "";
          setValue("client-email", draft.clientEmail);
        }
      });
    }
    refresh();
  }

  function stepQty(id, delta) {
    var current = clampQty(draft.qty[id]);
    var next = current + delta;
    if (next < 0) next = 0;
    if (next > 99) next = 99;
    draft.qty[id] = next;
    setValue("qty-" + id, next);
    markDirty();
    refresh();
  }

  function clampQty(value) {
    var n = Math.round(Number(value));
    if (!isFinite(n) || n < 0) return 0;
    if (n > 99) return 99;
    return n;
  }

  function choice(pkg) {
    var radio = input({
      type: "radio",
      name: "packageId",
      value: pkg.id,
      "data-draft": "packageId",
      checked: draft.packageId === pkg.id ? "checked" : null
    });
    var name = el("span", { class: "qt-choice-name", text: pkg.name });
    if (pkg.placeholder) name.appendChild(el("span", { class: "qt-badge", text: "Placeholder" }));
    var copy = el("span", { children: [
      name,
      el("span", { class: "qt-choice-desc fine", text: packageBlurb(pkg) })
    ]});
    return el("label", {
      class: "qt-choice",
      children: [
        radio,
        copy,
        el("span", { class: "qt-choice-price", text: engine.moneyShort(Math.round(Number(pkg.price) * 100)) })
      ]
    });
  }

  function qtyRow(item) {
    var less = el("button", { class: "icon-btn", type: "button", text: "−", "aria-label": "Fewer " + item.name });
    var more = el("button", { class: "icon-btn", type: "button", text: "+", "aria-label": "More " + item.name });
    var box = input({
      id: "qty-" + item.id,
      type: "number",
      min: "0",
      max: "99",
      step: "1",
      inputmode: "numeric",
      value: "0",
      "data-draft": "qty:" + item.id,
      "aria-label": item.name + " quantity"
    });
    less.addEventListener("click", function () { stepQty(item.id, -1); });
    more.addEventListener("click", function () { stepQty(item.id, 1); });
    var title = el("p", { children: [el("span", { class: "qt-choice-name", text: item.name })] });
    if (item.placeholder) title.appendChild(el("span", { class: "qt-badge", text: "Placeholder" }));
    return el("div", {
      class: "qt-qty",
      children: [
        el("div", {
          class: "qt-qty-copy",
          children: [
            title,
            el("p", { class: "fine", "data-hint-for": item.id, text: "" })
          ]
        }),
        el("div", { class: "qt-stepper", children: [less, box, more] })
      ]
    });
  }

  function addonRow(item) {
    var box = input({
      id: "addon-" + item.id,
      type: "checkbox",
      "data-draft": "addon:" + item.id
    });
    var text = el("span", { children: [
      el("span", { class: "qt-choice-name", text: item.name + " · " + engine.moneyShort(Math.round(Number(item.price) * 100)) }),
      item.placeholder ? el("span", { class: "qt-badge", text: "Placeholder" }) : null,
      item.description ? el("span", { class: "qt-choice-desc fine", text: item.description }) : null
    ]});
    return el("label", { class: "qt-check", children: [box, text] });
  }

  function datalist(id, people) {
    var list = el("datalist", { id: id });
    people.forEach(function (person) {
      list.appendChild(el("option", { value: person.name }));
    });
    return list;
  }

  function build() {
    if (!main) return;
    var people = clients();
    var realtors = people.filter(function (person) { return person.role === "Realtor"; });
    var head = el("div", { class: "page-head no-print", children: [
      el("h1", { class: "page-title", text: "Quote builder" }),
      el("p", { class: "lede", text: "Build a sample quote. Totals update as you type. Download a PDF or copy a link the client can open." }),
      el("p", { class: "qt-links", children: [
        el("a", { href: "price-list.html", text: "Price list" }),
        el("a", { href: "quotes.html", text: "Quote pipeline" })
      ]})
    ]});
    var notice = el("div", { class: "qt-notice no-print", children: [
      el("p", { text: "Sample price list. Replace the rates on the Price list page with real ones when you have them. Anything marked Placeholder was not in the draft price list." }),
      el("p", { text: "Edits and saved quotes stay in this browser. They are not stored on the server. Placeholder wording is left off the client quote." })
    ]});
    var running = el("div", { class: "qt-running no-print", children: [
      el("span", { text: "Quote total" }),
      el("strong", { id: "running-total", text: "$0.00" })
    ]});
    var warn = el("p", {
      id: "placeholder-warn",
      class: "qt-warn no-print",
      hidden: true,
      text: "This quote uses placeholder prices. Confirm them on the Price list page before sending it."
    });
    var cap = el("p", {
      id: "cap-note",
      class: "fine no-print",
      hidden: true,
      text: "The discount was limited to the subtotal."
    });

    var number = input({ id: "quote-number", "data-draft": "quoteNumber", type: "text", maxlength: "40", autocomplete: "off" });
    var date = input({ id: "quote-date", "data-draft": "date", type: "date" });
    var days = input({ id: "valid-days", "data-draft": "validDays", type: "number", min: "1", max: "365", step: "1" });
    var client = input({ id: "client-name", "data-draft": "clientName", type: "text", maxlength: "80", list: "client-names", autocomplete: "name" });
    var email = input({ id: "client-email", "data-draft": "clientEmail", type: "email", maxlength: "120", autocomplete: "email", placeholder: "Optional" });
    var agent = input({ id: "agent-name", "data-draft": "agentName", type: "text", maxlength: "80", list: "agent-names", autocomplete: "off", placeholder: "Optional" });
    var address = input({
      id: "address",
      "data-draft": "address",
      type: "text",
      maxlength: "180",
      autocomplete: "off",
      placeholder: "123 Sample Street, Carlsbad, CA"
    });
    var occVacant = input({ type: "radio", name: "occupancy", value: "vacant", "data-draft": "occupancy", checked: "checked" });
    var occOccupied = input({ type: "radio", name: "occupancy", value: "occupied", "data-draft": "occupancy" });
    var packages = el("div");
    (catalog.packages || []).forEach(function (pkg) { packages.appendChild(choice(pkg)); });
    var quantities = el("div");
    (catalog.quantityItems || []).forEach(function (item) { quantities.appendChild(qtyRow(item)); });
    var addons = el("div");
    (catalog.addons || []).forEach(function (item) { addons.appendChild(addonRow(item)); });
    var discount = input({ id: "discount-value", "data-draft": "discountValue", type: "number", min: "0", step: "0.01", value: "0" });
    var discountMode = el("select", { id: "discount-mode", "data-draft": "discountMode" });
    discountMode.appendChild(el("option", { value: "amount", text: "Dollars off" }));
    discountMode.appendChild(el("option", { value: "percent", text: "Percent off" }));
    var notes = el("textarea", { id: "notes", "data-draft": "notes", maxlength: "800", rows: "4", placeholder: "Optional note for the client" });
    var addCustom = el("button", { class: "btn btn-small btn-ghost", type: "button", text: "Add a custom line" });
    addCustom.addEventListener("click", function () {
      markDirty();
      readCustomLines();
      var row = { id: customId(), name: "", amount: "" };
      draft.customLines.push(row);
      var host = document.getElementById("custom-lines");
      var node = customRow(row);
      host.appendChild(node);
      var focus = node.querySelector("input");
      if (focus) focus.focus();
    });

    var copyBtn = el("button", { class: "btn", type: "button", id: "copy-link", children: [icon("fa-link"), document.createTextNode(" Copy link")] });
    var pdfBtn = el("button", { class: "btn", type: "button", id: "download-pdf", children: [icon("fa-file-pdf"), document.createTextNode(" Download PDF")] });
    var saveBtn = el("button", { class: "btn btn-ghost", type: "button", children: [icon("fa-floppy-disk"), document.createTextNode(" Save quote")] });
    var newBtn = el("button", { class: "btn btn-ghost", type: "button", text: "New quote" });
    copyBtn.addEventListener("click", copyLink);
    pdfBtn.addEventListener("click", downloadPdf);
    saveBtn.addEventListener("click", saveQuote);
    newBtn.addEventListener("click", newQuote);

    var share = input({ id: "share-url", type: "text", readonly: "readonly" });
    var linkField = field("Share link", share, true);
    linkField.id = "link-field";
    linkField.hidden = true;

    var form = el("div", { class: "qt-form no-print", children: [
      el("section", { class: "card", children: [
        el("h2", { text: "Quote" }),
        el("div", { class: "qt-fields", children: [
          field("Quote number", number),
          field("Date", date),
          field("Valid for (days)", days, true)
        ]})
      ]}),
      el("section", { class: "card", children: [
        el("h2", { text: "Client and property" }),
        field("Client name", client, true),
        field("Client email", email, true),
        field("Agent name", agent, true),
        field("Property address", address, true),
        el("fieldset", { class: "field", children: [
          el("legend", { text: "Occupied or vacant" }),
          el("label", { class: "qt-check", children: [occVacant, el("span", { text: "Vacant" })] }),
          el("label", { class: "qt-check", children: [occOccupied, el("span", { text: "Occupied" })] })
        ]}),
        datalist("client-names", people),
        datalist("agent-names", realtors)
      ]}),
      el("section", { class: "card", children: [
        el("h2", { text: "Package" }),
        el("p", { class: "fine", text: "One package per quote. The price is a flat fee. Included months and the media package are already inside it." }),
        packages
      ]}),
      el("section", { class: "card", children: [
        el("h2", { text: "Quantities" }),
        el("p", { class: "fine", text: "Rental extension is a percent of the package price only, not of extra rooms or add-ons." }),
        quantities
      ]}),
      el("section", { class: "card", children: [
        el("h2", { text: "Add-ons" }),
        addons
      ]}),
      el("section", { class: "card", children: [
        el("h2", { text: "Adjustments" }),
        el("div", { class: "qt-inline", children: [
          field("Discount", discount),
          field("Discount type", discountMode)
        ]}),
        el("div", { id: "custom-lines" }),
        addCustom,
        field("Notes for the client", notes, true)
      ]}),
      el("section", { class: "card", children: [
        el("div", { class: "qt-actions", children: [copyBtn, pdfBtn, saveBtn, newBtn] }),
        el("p", { id: "qt-status", class: "qt-status", "aria-live": "polite" }),
        linkField
      ]}),
      el("section", { class: "card", children: [
        el("h2", { text: "Saved in this browser" }),
        el("p", { class: "fine", text: "Saved quotes remember the choices. Opening one prices them with the list currently saved in this browser. A copied link keeps the numbers from the moment it was copied." }),
        el("div", { id: "saved-list", class: "qt-saved" })
      ]})
    ]});

    var preview = el("div", { class: "qt-preview", children: [
      el("div", { id: "quote-slot" }),
      el("p", {
        class: "fine qt-preview-note no-print",
        text: "Download PDF opens the print dialog. Choose Save as PDF, and turn off headers if you do not want the page address on the sheet. Copy link opens a read-only page. The quote rides in the link."
      })
    ]});

    var root = el("div", { class: "qt" });
    root.append(head, notice, running, warn, cap, el("div", { class: "qt-layout", children: [form, preview] }));
    main.replaceChildren(root);
    root.addEventListener("input", onField);
    root.addEventListener("change", onField);
    fillForm();
  }

  window.addEventListener("beforeunload", function (event) {
    if (!dirty) return;
    event.preventDefault();
    event.returnValue = "";
  });

  build();
})();

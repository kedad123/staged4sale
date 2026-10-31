/* Editable sample price list. The seed lives in quote-catalog.js.
   Saves go to localStorage in this browser only. */
(function () {
  var brand = window.AdminBrand || {};
  var engine = window.QuoteEngine;
  var state = window.QuoteCatalog.load();
  var main = document.getElementById("main");
  document.title = "Price list · " + (brand.businessName || "Staged4Sale");

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

  function field(label, control, span) {
    return el("label", {
      class: span ? "field qt-span" : "field",
      children: [el("span", { text: label }), control]
    });
  }

  function input(attrs) {
    return el("input", attrs);
  }

  function newId(prefix) {
    return prefix + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function termsToText(list) {
    return (list || []).join("\n\n");
  }

  function termsFromText(text) {
    return String(text || "").split(/\n\s*\n/).map(function (part) {
      return part.trim();
    }).filter(Boolean);
  }

  function listFor(kind) {
    if (kind === "packages") return state.packages;
    if (kind === "quantityItems") return state.quantityItems;
    if (kind === "addons") return state.addons;
    return null;
  }

  function findItem(kind, id) {
    var list = listFor(kind);
    if (!list) return null;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function setNote(ok) {
    var note = document.getElementById("save-note");
    if (!note) return;
    note.textContent = ok
      ? "Saved in this browser only. Nothing was sent to a server."
      : "Could not save in this browser. These edits will disappear on refresh.";
  }

  function persist() {
    setNote(window.QuoteCatalog.save(state));
  }

  function assign(item, fieldName, raw, kind) {
    if (fieldName === "name" || fieldName === "description" || fieldName === "unit") {
      item[fieldName] = raw;
      return;
    }
    if (fieldName === "placeholder") {
      item.placeholder = raw === true || raw === "true";
      return;
    }
    if (fieldName === "kind") {
      item.kind = raw === "consult" ? "consult" : "stage";
      return;
    }
    if (fieldName === "pricing") {
      item.pricing = raw === "percent" ? "percent" : "flat";
      return;
    }
    if (fieldName === "price" || fieldName === "mediaIncluded" || fieldName === "percent") {
      if (String(raw).trim() === "") return;
      var max = fieldName === "percent" ? 100 : 10000000;
      var n = Number(raw);
      if (!isFinite(n) || n < 0) n = 0;
      if (n > max) n = max;
      item[fieldName] = Math.round(n * 100) / 100;
      return;
    }
    if (fieldName === "includedRooms" || fieldName === "includedMonths" || fieldName === "piecesPerRoom") {
      if (String(raw).trim() === "") return;
      var cap = fieldName === "includedMonths" ? 36 : 99;
      var whole = Math.round(Number(raw));
      if (!isFinite(whole) || whole < 0) whole = 0;
      if (whole > cap) whole = cap;
      item[fieldName] = whole;
      return;
    }
    if (kind) item[fieldName] = raw;
  }

  function writeBack(target, item) {
    var fieldName = target.getAttribute("data-field");
    if (!item || !fieldName) return;
    if (target.type === "number" && item[fieldName] != null && String(target.value).trim() !== "") {
      target.value = String(item[fieldName]);
    }
  }

  function syncCardChrome(card, item) {
    var badge = card.querySelector("[data-badge]");
    if (badge) badge.hidden = !item.placeholder;
    var priceWrap = card.querySelector("[data-price-wrap]");
    var percentWrap = card.querySelector("[data-percent-wrap]");
    if (priceWrap) priceWrap.hidden = item.pricing === "percent";
    if (percentWrap) percentWrap.hidden = item.pricing !== "percent";
  }

  function onEdit(event) {
    var target = event.target;
    if (target.name === "defaultPackage") {
      state.defaultPackageId = target.value;
      persist();
      return;
    }
    if (target.id === "valid-days") {
      if (String(target.value).trim() === "" && event.type === "input") return;
      var days = Math.round(Number(target.value));
      if (!isFinite(days) || days < 1) days = 1;
      if (days > 365) days = 365;
      state.quoteValidDays = days;
      if (event.type === "change") target.value = String(days);
      persist();
      return;
    }
    if (target.id === "terms") {
      state.terms = termsFromText(target.value);
      persist();
      return;
    }
    var fieldName = target.getAttribute("data-field");
    var card = target.closest("[data-kind]");
    if (!fieldName || !card) return;
    var item = findItem(card.getAttribute("data-kind"), card.getAttribute("data-id"));
    if (!item) return;
    var value = target.type === "checkbox" ? target.checked : target.value;
    if ((target.type === "number") && String(target.value).trim() === "" && event.type === "input") return;
    assign(item, fieldName, value);
    if (event.type === "change") writeBack(target, item);
    syncCardChrome(card, item);
    persist();
  }

  function badge(on) {
    return el("span", { class: "qt-badge", "data-badge": "1", hidden: on ? null : true, text: "Placeholder" });
  }

  function removeButton(label) {
    return el("button", {
      class: "btn btn-small btn-ghost",
      type: "button",
      "data-remove": "1",
      text: "Remove",
      "aria-label": "Remove " + label
    });
  }

  function packageCard(pkg) {
    var name = input({ "data-field": "name", type: "text", maxlength: "80", value: pkg.name });
    var price = input({ "data-field": "price", type: "number", min: "0", step: "0.01", value: String(pkg.price) });
    var kind = el("select", { "data-field": "kind" });
    kind.appendChild(el("option", { value: "stage", text: "Staging" }));
    kind.appendChild(el("option", { value: "consult", text: "Consultation" }));
    kind.value = pkg.kind === "consult" ? "consult" : "stage";
    var description = el("textarea", { "data-field": "description", maxlength: "400", rows: "3" });
    description.value = pkg.description || "";
    var rooms = input({ "data-field": "includedRooms", type: "number", min: "0", max: "99", step: "1", value: String(pkg.includedRooms) });
    var months = input({ "data-field": "includedMonths", type: "number", min: "0", max: "36", step: "1", value: String(pkg.includedMonths) });
    var media = input({ "data-field": "mediaIncluded", type: "number", min: "0", step: "0.01", value: String(pkg.mediaIncluded) });
    var pieces = input({ "data-field": "piecesPerRoom", type: "number", min: "0", max: "99", step: "1", value: String(pkg.piecesPerRoom) });
    var placeholder = input({ "data-field": "placeholder", type: "checkbox", checked: pkg.placeholder ? "checked" : null });
    var starter = input({
      type: "radio",
      name: "defaultPackage",
      value: pkg.id,
      checked: state.defaultPackageId === pkg.id ? "checked" : null
    });
    return el("article", {
      class: "card qt-edit",
      "data-kind": "packages",
      "data-id": pkg.id,
      children: [
        el("div", { class: "qt-edit-top", children: [badge(pkg.placeholder), removeButton(pkg.name)] }),
        el("div", { class: "qt-fields", children: [
          field("Name", name),
          field("Price (USD)", price),
          field("Kind", kind),
          field("Description", description, true),
          field("Included rooms", rooms),
          field("Included months", months),
          field("Media included (USD value, not an extra charge)", media),
          field("Furniture pieces per room", pieces)
        ]}),
        el("label", { class: "qt-check-line", children: [placeholder, el("span", { text: "Placeholder — this number is not confirmed" })] }),
        el("label", { class: "qt-check-line", children: [starter, el("span", { text: "Starting package for a new quote" })] })
      ]
    });
  }

  function qtyCard(item) {
    var name = input({ "data-field": "name", type: "text", maxlength: "80", value: item.name });
    var unit = input({ "data-field": "unit", type: "text", maxlength: "24", value: item.unit });
    var pricing = el("select", { "data-field": "pricing" });
    pricing.appendChild(el("option", { value: "flat", text: "Flat price each" }));
    pricing.appendChild(el("option", { value: "percent", text: "Percent of the package price" }));
    pricing.value = item.pricing === "percent" ? "percent" : "flat";
    var price = input({ "data-field": "price", type: "number", min: "0", step: "0.01", value: String(item.price) });
    var percent = input({ "data-field": "percent", type: "number", min: "0", max: "100", step: "0.1", value: String(item.percent) });
    var description = el("textarea", { "data-field": "description", maxlength: "400", rows: "2" });
    description.value = item.description || "";
    var placeholder = input({ "data-field": "placeholder", type: "checkbox", checked: item.placeholder ? "checked" : null });
    var priceWrap = field("Price (USD)", price);
    priceWrap.setAttribute("data-price-wrap", "");
    priceWrap.hidden = item.pricing === "percent";
    var percentWrap = field("Percent of the package price", percent);
    percentWrap.setAttribute("data-percent-wrap", "");
    percentWrap.hidden = item.pricing !== "percent";
    return el("article", {
      class: "card qt-edit",
      "data-kind": "quantityItems",
      "data-id": item.id,
      children: [
        el("div", { class: "qt-edit-top", children: [badge(item.placeholder), removeButton(item.name)] }),
        el("div", { class: "qt-fields", children: [
          field("Name", name),
          field("Unit", unit),
          field("How it is priced", pricing, true),
          priceWrap,
          percentWrap,
          field("Description", description, true)
        ]}),
        el("label", { class: "qt-check-line", children: [placeholder, el("span", { text: "Placeholder — this number is not confirmed" })] })
      ]
    });
  }

  function addonCard(item) {
    var name = input({ "data-field": "name", type: "text", maxlength: "80", value: item.name });
    var price = input({ "data-field": "price", type: "number", min: "0", step: "0.01", value: String(item.price) });
    var description = el("textarea", { "data-field": "description", maxlength: "400", rows: "2" });
    description.value = item.description || "";
    var placeholder = input({ "data-field": "placeholder", type: "checkbox", checked: item.placeholder ? "checked" : null });
    return el("article", {
      class: "card qt-edit",
      "data-kind": "addons",
      "data-id": item.id,
      children: [
        el("div", { class: "qt-edit-top", children: [badge(item.placeholder), removeButton(item.name)] }),
        el("div", { class: "qt-fields", children: [
          field("Name", name),
          field("Price (USD)", price),
          field("Description", description, true)
        ]}),
        el("label", { class: "qt-check-line", children: [placeholder, el("span", { text: "Placeholder — this number is not confirmed" })] })
      ]
    });
  }

  function addButton(kind, label) {
    return el("button", { class: "btn btn-ghost", type: "button", "data-add": kind, text: label });
  }

  function resetList() {
    if (!window.confirm("Reset the price list to the sample defaults? This replaces the prices saved in this browser.")) return;
    state = window.QuoteCatalog.reset();
    render();
    setNote(true);
  }

  function onClick(event) {
    var add = event.target.closest("[data-add]");
    if (add) {
      var kind = add.getAttribute("data-add");
      if (kind === "packages") {
        state.packages.push({
          id: newId("pkg"),
          name: "New package",
          description: "",
          price: 0,
          kind: "stage",
          includedRooms: 0,
          includedMonths: 0,
          mediaIncluded: 0,
          piecesPerRoom: 0,
          placeholder: true
        });
      } else if (kind === "quantityItems") {
        state.quantityItems.push({
          id: newId("qty"),
          name: "New quantity",
          description: "",
          unit: "item",
          pricing: "flat",
          price: 0,
          percent: 0,
          placeholder: true
        });
      } else if (kind === "addons") {
        state.addons.push({
          id: newId("add"),
          name: "New add-on",
          description: "",
          price: 0,
          placeholder: true
        });
      }
      persist();
      render();
      var cards = document.querySelectorAll("[data-kind='" + kind + "']");
      var last = cards[cards.length - 1];
      if (last) {
        var focus = last.querySelector("[data-field='name']");
        if (focus) focus.focus();
        last.scrollIntoView({ block: "nearest" });
      }
      return;
    }
    var remove = event.target.closest("[data-remove]");
    if (!remove) return;
    var card = remove.closest("[data-kind]");
    if (!card) return;
    var kindName = card.getAttribute("data-kind");
    var id = card.getAttribute("data-id");
    var list = listFor(kindName);
    if (!list) return;
    var next = list.filter(function (item) { return item.id !== id; });
    if (kindName === "packages") {
      state.packages = next;
      if (state.defaultPackageId === id) state.defaultPackageId = (next[0] && next[0].id) || "";
    } else if (kindName === "quantityItems") state.quantityItems = next;
    else state.addons = next;
    persist();
    render();
  }

  function render() {
    if (!main) return;
    var days = input({
      id: "valid-days",
      type: "number",
      min: "1",
      max: "365",
      step: "1",
      value: String(state.quoteValidDays || 30)
    });
    var terms = el("textarea", { id: "terms", rows: "12" });
    terms.value = termsToText(state.terms);
    var resetTop = el("button", { class: "btn btn-ghost", type: "button", id: "reset-prices", text: "Reset to sample defaults" });
    var resetBottom = el("button", { class: "btn btn-ghost", type: "button", id: "reset-prices-bottom", text: "Reset to sample defaults" });
    resetTop.addEventListener("click", resetList);
    resetBottom.addEventListener("click", resetList);

    var packageHost = el("div", { id: "package-host" });
    state.packages.forEach(function (pkg) { packageHost.appendChild(packageCard(pkg)); });
    var qtyHost = el("div");
    state.quantityItems.forEach(function (item) { qtyHost.appendChild(qtyCard(item)); });
    var addonHost = el("div");
    state.addons.forEach(function (item) { addonHost.appendChild(addonCard(item)); });

    var seed = window.QuoteCatalog.defaults();
    var seedFull = null;
    var seedConsult = null;
    var seedExt = null;
    seed.packages.forEach(function (pkg) {
      if (pkg.id === "full-service") seedFull = pkg;
      if (pkg.id === "consultation") seedConsult = pkg;
    });
    seed.quantityItems.forEach(function (item) {
      if (item.id === "extra-month") seedExt = item;
    });
    var seedText = "The draft fixed list is consultation " +
      engine.moneyShort(Math.round(seedConsult.price * 100)) + " and " + seedFull.name + " at " +
      engine.moneyShort(Math.round(seedFull.price * 100)) + ", with a " +
      engine.moneyShort(Math.round(seedFull.mediaIncluded * 100)) + " media package and " +
      seedFull.includedMonths + " months of rental included in that fee. Extension is " +
      seedExt.percent + "% of the package price per extra month.";
    var root = el("div", { class: "qt" });
    root.append(
      el("div", { class: "page-head", children: [
        el("h1", { class: "page-title", text: "Price list" }),
        el("p", { class: "lede", text: "Edit every sample rate, name, description, and default. New quotes use whatever is saved in this browser." }),
        el("p", { class: "qt-links", children: [
          el("a", { href: "quote-builder.html", text: "Quote builder" }),
          el("a", { href: "quotes.html", text: "Quote pipeline" })
        ]})
      ]}),
      el("div", { class: "qt-notice", children: [
        el("p", { text: "These are sample prices until you replace them with your real rates. " + seedText }),
        el("p", { text: "Anything marked Placeholder was not in that draft. Uncheck Placeholder after you confirm a number. Edits save only in this browser and are not stored on the server." })
      ]}),
      el("div", { class: "qt-editor-actions", children: [
        resetTop,
        el("p", { id: "save-note", class: "fine", text: "Saved in this browser only. Nothing was sent to a server." })
      ]}),
      el("h2", { class: "qt-section-title", text: "Packages" }),
      el("p", { class: "fine", text: "The package price is a flat fee. Included rooms, months, pieces, and the media value describe what that fee already covers. They are not added again." }),
      packageHost,
      addButton("packages", "Add a package"),
      el("h2", { class: "qt-section-title", text: "Quantity items" }),
      el("p", { class: "fine", text: "Use a flat price, or a percent of the selected package price. The rental extension uses that percent. It does not include extra rooms or add-ons." }),
      qtyHost,
      addButton("quantityItems", "Add a quantity item"),
      el("h2", { class: "qt-section-title", text: "Add-ons" }),
      addonHost,
      addButton("addons", "Add an add-on"),
      el("h2", { class: "qt-section-title", text: "Quote defaults" }),
      el("div", { class: "card", children: [
        field("Quote stays valid for (days)", days, true),
        field("Terms, one paragraph per block (a blank line between them)", terms, true)
      ]}),
      el("div", { class: "qt-editor-actions", children: [resetBottom] })
    );
    main.replaceChildren(root);
    root.addEventListener("input", onEdit);
    root.addEventListener("change", onEdit);
    root.addEventListener("click", onClick);
  }

  render();
})();

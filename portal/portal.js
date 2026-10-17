/* Client portal behavior. Business name, colors, logo, and contact
   details come from brand.js. Demo content comes from sample-data.js. */
(function () {
  var brand = window.PortalBrand;
  var sample = window.PortalSample;
  var page = document.body.getAttribute("data-page");

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

  function formatIsoDate(iso) {
    var parts = String(iso || "").split("-");
    if (parts.length !== 3) return String(iso || "");
    var date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (isNaN(date.getTime())) return String(iso);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    }).format(date);
  }

  function money(amount) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(Number(amount) || 0);
  }

  function fillTemplate(text, values) {
    return String(text).replace(/\{\{(\w+)\}\}/g, function (_, key) {
      return values[key] != null ? values[key] : "";
    });
  }

  function templateValues() {
    var property = (sample && sample.property) || {};
    var client = (sample && sample.client) || {};
    var contact = (brand && brand.contact) || {};
    return {
      clientName: client.fullName || "",
      clientEmail: client.email || "",
      address: [property.addressLine1, property.addressLine2].filter(Boolean).join(", "),
      businessName: (brand && brand.businessName) || "",
      advisorName: contact.advisorName || "",
      email: contact.email || ""
    };
  }

  function messageHref() {
    var contact = (brand && brand.contact) || {};
    var subject = encodeURIComponent((brand && brand.messageSubject) || "Question about my project");
    return "mailto:" + (contact.email || "") + "?subject=" + subject;
  }

  function messageLink() {
    var name = (brand && brand.contact && brand.contact.advisorName) || "us";
    return el("a", {
      class: "btn",
      href: messageHref(),
      text: "Message " + name
    });
  }

  function pageTitle() {
    var name = (brand && brand.businessName) || "Client portal";
    if (page === "dashboard") return "Dashboard · " + name;
    if (page === "forgot") return "Forgot password · " + name;
    if (page === "document") return "Document · " + name;
    return "Sign in · " + name;
  }

  function lookup(key) {
    if (!brand) return null;
    var contact = brand.contact || {};
    if (key === "tagline") return brand.tagline;
    if (key === "businessName") return brand.businessName;
    if (key === "phone") return contact.phoneDisplay;
    if (key === "email") return contact.email;
    return null;
  }

  function paintBrand() {
    document.title = pageTitle();
    if (!brand) return;

    document.querySelectorAll("img.logo").forEach(function (img) {
      img.src = brand.logoSrc;
      img.alt = brand.logoAlt || brand.businessName || "";
    });

    document.querySelectorAll("[data-fill]").forEach(function (node) {
      var value = lookup(node.getAttribute("data-fill"));
      if (value != null) node.textContent = value;
    });

    document.querySelectorAll("[data-href-kind]").forEach(function (node) {
      var kind = node.getAttribute("data-href-kind");
      var contact = brand.contact || {};
      if (kind === "phone" && contact.phoneTel) node.setAttribute("href", "tel:" + contact.phoneTel);
      if (kind === "email" && contact.email) node.setAttribute("href", "mailto:" + contact.email);
      if (kind === "public") node.setAttribute("href", brand.publicSiteHref || "../");
    });

    document.querySelectorAll("a.public-link").forEach(function (node) {
      node.textContent = brand.businessName || "Home";
    });

    document.querySelectorAll("a.logo-link").forEach(function (node) {
      if (page === "dashboard" || page === "document") {
        node.setAttribute("href", "dashboard.html");
        node.setAttribute("aria-label", "Dashboard");
      } else {
        node.setAttribute("href", brand.publicSiteHref || "../");
      }
    });

    if (sample && sample.banner) {
      document.querySelectorAll(".sample-banner").forEach(function (node) {
        node.textContent = sample.banner;
      });
    }
  }

  function openLightbox(src, alt, caption) {
    var dialog = document.getElementById("lightbox");
    if (!dialog || typeof dialog.showModal !== "function") return;
    var image = dialog.querySelector("img");
    var captionNode = dialog.querySelector(".lightbox-caption");
    image.src = src;
    image.alt = alt || "";
    captionNode.textContent = caption || "";
    if (!dialog.open) dialog.showModal();
  }

  function initLightbox() {
    var dialog = document.getElementById("lightbox");
    if (!dialog) return;
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", function () {
      var image = dialog.querySelector("img");
      image.removeAttribute("src");
    });
    document.body.addEventListener("click", function (event) {
      var trigger = event.target.closest("[data-photo]");
      if (!trigger) return;
      openLightbox(
        trigger.getAttribute("data-photo"),
        trigger.getAttribute("data-photo-alt"),
        trigger.getAttribute("data-caption")
      );
    });
  }

  function initLogin() {
    var form = document.getElementById("login-form");
    if (!form) return;
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      window.location.href = "dashboard.html";
    });
  }

  function initForgot() {
    var form = document.getElementById("forgot-form");
    if (!form) return;
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var result = document.getElementById("forgot-result");
      if (!result) return;
      result.hidden = false;
      result.textContent = "This is a sample. No reset email was sent.";
    });
  }

  function renderProperty(property) {
    var host = document.getElementById("property");
    if (!host || !property) return;
    var address = [property.addressLine1, property.addressLine2].filter(Boolean).join(", ");
    host.append(
      el("button", {
        class: "property-photo-btn",
        type: "button",
        "data-photo": property.photo,
        "data-photo-alt": property.photoAlt || address,
        "data-caption": address,
        children: [
          el("img", {
            class: "property-photo",
            src: property.photo,
            alt: property.photoAlt || ""
          })
        ]
      }),
      el("div", {
        class: "property-copy",
        children: [
          el("p", { class: "eyebrow", text: "Your property" }),
          el("p", { class: "property-address", text: property.addressLine1 || "" }),
          el("p", { class: "property-city", text: property.addressLine2 || "" }),
          property.photoNote ? el("p", { class: "photo-note", text: property.photoNote }) : null
        ]
      })
    );
  }

  function renderStatus(status) {
    var host = document.getElementById("status");
    if (!host || !status) return;
    var steps = status.steps || [];
    var currentIndex = steps.indexOf(status.current);
    var items = steps.map(function (label, index) {
      var state = "is-upcoming";
      if (currentIndex !== -1 && index < currentIndex) state = "is-complete";
      if (index === currentIndex) state = "is-current";
      var mark = state === "is-complete" ? "\u2713" : String(index + 1);
      return el("li", {
        class: "step " + state,
        "aria-current": state === "is-current" ? "step" : null,
        children: [
          el("span", { class: "step-mark", "aria-hidden": "true", text: mark }),
          el("span", {
            class: "step-text",
            children: [
              el("span", { class: "step-label", text: label }),
              state === "is-current" ? el("span", { class: "now", text: "Now" }) : null
            ]
          })
        ]
      });
    });

    host.append(
      el("h2", { text: "Status" }),
      el("p", { class: "current-step", text: "Current step: " + (status.current || "Not set") }),
      el("ol", { class: "steps", "aria-label": "Project status", children: items }),
      status.note ? el("p", { class: "status-note", text: status.note }) : null
    );
  }

  function renderDates(dates) {
    var host = document.getElementById("dates");
    if (!host) return;
    var rows = (dates || []).map(function (item) {
      return el("div", {
        class: "date-row",
        children: [
          el("dt", { text: item.label }),
          el("dd", {
            children: [
              document.createTextNode(formatIsoDate(item.iso)),
              item.detail ? el("span", { class: "date-detail", text: item.detail }) : null
            ]
          })
        ]
      });
    });
    host.append(
      el("h2", { text: "Key dates" }),
      el("dl", { class: "date-list", children: rows })
    );
  }

  function renderInvoice(invoice) {
    var host = document.getElementById("invoice");
    if (!host || !invoice) return;
    var items = invoice.items || [];
    var subtotal = items.reduce(function (sum, item) {
      return sum + (Number(item.amount) || 0);
    }, 0);
    var paid = Number(invoice.paid) || 0;
    var balance = subtotal - paid;
    var issued = invoice.issued ? "Issued " + formatIsoDate(invoice.issued) : "";
    var meta = [invoice.number, invoice.status, issued].filter(Boolean).join(" · ");

    host.append(
      el("h2", { text: "Quote & invoice" }),
      el("p", { class: "invoice-meta", text: meta }),
      el("table", {
        class: "line-items",
        children: [
          el("tbody", {
            children: items.map(function (item) {
              return el("tr", {
                children: [
                  el("td", { text: item.label }),
                  el("td", { text: money(item.amount) })
                ]
              });
            })
          })
        ]
      }),
      el("dl", {
        class: "totals",
        children: [
          el("div", {
            children: [
              el("dt", { text: "Subtotal" }),
              el("dd", { text: money(subtotal) })
            ]
          }),
          el("div", {
            children: [
              el("dt", { text: "Payments received" }),
              el("dd", { text: "\u2212" + money(paid) })
            ]
          }),
          el("div", {
            class: "balance",
            children: [
              el("dt", { text: "Balance due" }),
              el("dd", { text: money(balance) })
            ]
          })
        ]
      }),
      el("div", {
        class: "pay-row",
        children: [
          el("button", {
            class: "btn",
            type: "button",
            disabled: true,
            "aria-describedby": "pay-note",
            text: "Pay now"
          }),
          el("p", { class: "coming-soon", id: "pay-note", text: "Coming soon" })
        ]
      }),
      el("p", { class: "pay-help", text: "Sample amounts. Nothing can be paid from this page." })
    );
  }

  function renderGallery(gallery) {
    var host = document.getElementById("gallery");
    if (!host) return;
    var pairs = (gallery || []).map(function (pair) {
      return el("article", {
        class: "pair",
        children: [
          el("h3", { text: pair.room }),
          el("div", {
            class: "pair-grid",
            children: ["before", "after"].map(function (side) {
              var photo = pair[side] || {};
              var label = side === "before" ? "Before" : "After";
              var caption = pair.room + " — " + label;
              return el("button", {
                class: "shot",
                type: "button",
                "data-photo": photo.src,
                "data-photo-alt": photo.alt || caption,
                "data-caption": caption,
                children: [
                  el("img", {
                    src: photo.src,
                    alt: photo.alt || caption,
                    loading: "lazy"
                  }),
                  el("span", { class: "shot-label", text: label })
                ]
              });
            })
          })
        ]
      });
    });
    host.append(el("h2", { text: "Before & after" }), el("div", { class: "pairs", children: pairs }));
  }

  function renderDocuments(documents) {
    var host = document.getElementById("documents");
    if (!host) return;
    var list = el("ul", {
      class: "doc-list",
      children: (documents || []).map(function (doc) {
        var meta = [doc.status, doc.iso ? formatIsoDate(doc.iso) : ""].filter(Boolean).join(" · ");
        return el("li", {
          children: [
            el("div", {
              children: [
                el("p", { class: "doc-title", text: doc.title }),
                el("p", { class: "doc-meta", text: meta })
              ]
            }),
            el("a", {
              class: "text-link",
              href: "document.html?doc=" + encodeURIComponent(doc.id),
              text: "View sample"
            })
          ]
        });
      })
    });

    host.append(
      el("h2", { text: "Documents" }),
      list,
      el("div", {
        class: "message-row",
        children: [
          el("p", { text: "Questions about this project?" }),
          messageLink()
        ]
      })
    );
  }

  function initDashboard() {
    var main = document.getElementById("main");
    if (!sample) {
      if (main) main.appendChild(el("p", { class: "card", text: "Demo data is missing from this sample." }));
      return;
    }
    var client = sample.client || {};
    var welcome = document.getElementById("welcome");
    var clientLine = document.getElementById("client-line");
    if (welcome) welcome.textContent = "Welcome back, " + (client.firstName || "there") + ".";
    if (clientLine) {
      clientLine.textContent = [client.fullName, client.email].filter(Boolean).join(" · ");
    }
    renderProperty(sample.property);
    renderStatus(sample.status);
    renderDates(sample.dates);
    renderInvoice(sample.invoice);
    renderGallery(sample.gallery);
    renderDocuments(sample.documents);
    initLightbox();
  }

  function initDocument() {
    var sheet = document.getElementById("doc-sheet");
    if (!sheet) return;
    if (!sample || !sample.documents) {
      sheet.appendChild(el("h1", { text: "Demo data is missing from this sample." }));
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var id = params.get("doc");
    var documents = sample.documents;
    var doc = null;
    documents.forEach(function (item) {
      if (item.id === id) doc = item;
    });

    if (!doc) {
      sheet.append(
        el("h1", { text: "Sample documents" }),
        el("ul", {
          class: "doc-list",
          children: documents.map(function (item) {
            return el("li", {
              children: [
                el("a", {
                  href: "document.html?doc=" + encodeURIComponent(item.id),
                  text: item.title
                })
              ]
            });
          })
        })
      );
      return;
    }

    var values = templateValues();
    var meta = [doc.status, doc.iso ? formatIsoDate(doc.iso) : ""].filter(Boolean).join(" · ");
    sheet.append(
      el("p", { class: "stamp", text: "Sample" }),
      el("h1", { text: doc.title }),
      el("p", { class: "doc-kicker", text: meta }),
      el("div", {
        children: (doc.paragraphs || []).map(function (paragraph) {
          return el("p", { text: fillTemplate(paragraph, values) });
        })
      }),
      el("div", {
        class: "message-row",
        children: [
          el("p", { text: "Questions about this project?" }),
          messageLink()
        ]
      })
    );
  }

  paintBrand();
  if (page === "login") initLogin();
  else if (page === "forgot") initForgot();
  else if (page === "dashboard") initDashboard();
  else if (page === "document") initDocument();
})();

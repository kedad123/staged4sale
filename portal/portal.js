/* VIP portal behavior. Business name, colors, logo, and contact
   details come from brand.js. Demo content comes from sample-data.js. */
(function () {
  var brand = window.PortalBrand;
  var sample = window.PortalSample;
  var page = document.body.getAttribute("data-page");
  var PREFS_KEY = "portal-demo-prefs";

  var APP_PAGES = {
    listings: true,
    project: true,
    book: true,
    packets: true,
    market: true,
    newsletter: true,
    virtual: true,
    billing: true,
    account: true,
    document: true
  };

  var NAV = [
    { id: "listings", href: "listings.html", label: "My Listings", short: "Listings", tab: true },
    { id: "book", href: "book.html", label: "Book Staging", short: "Book", tab: true },
    { id: "packets", href: "packets.html", label: "Seller Packets", short: "Packets", tab: true },
    { id: "market", href: "market.html", label: "Market Info", short: "Market", tab: true },
    { id: "newsletter", href: "newsletter.html", label: "Staging ROI Newsletter", short: "Newsletter", tab: false },
    { id: "virtual", href: "virtual.html", label: "Virtual Staging", short: "Virtual", tab: false },
    { id: "billing", href: "billing.html", label: "Billing & Payments", short: "Billing", tab: false },
    { id: "account", href: "account.html", label: "Account", short: "Account", tab: false }
  ];

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

  function formatShort(iso) {
    var parts = String(iso || "").split("-");
    if (parts.length !== 3) return String(iso || "");
    var date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (isNaN(date.getTime())) return String(iso);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
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

  function moneyOrIncluded(amount) {
    if (Number(amount) === 0) return "Included";
    return money(amount);
  }

  function fillTemplate(text, values) {
    return String(text).replace(/\{\{(\w+)\}\}/g, function (_, key) {
      return values[key] != null ? values[key] : "";
    });
  }

  function readPrefs() {
    try {
      var raw = sessionStorage.getItem(PREFS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  }

  function writePrefs(prefs) {
    try {
      sessionStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch (err) {
      /* This demo still works if the browser blocks storage. */
    }
  }

  function agentProfile() {
    var agent = (sample && sample.agent) || {};
    var prefs = readPrefs() || {};
    var profile = prefs.profile || {};
    var notes = prefs.notifications || {};
    var baseNotes = agent.notifications || {};
    return {
      firstName: profile.firstName || agent.firstName || "",
      fullName: profile.fullName || agent.fullName || "",
      email: profile.email || agent.email || "",
      phone: profile.phone || agent.phone || "",
      license: profile.license || agent.license || "",
      notifications: {
        projects: notes.projects != null ? notes.projects : !!baseNotes.projects,
        invoices: notes.invoices != null ? notes.invoices : !!baseNotes.invoices,
        newsletter: notes.newsletter != null ? notes.newsletter : !!baseNotes.newsletter,
        booking: notes.booking != null ? notes.booking : !!baseNotes.booking
      }
    };
  }

  function agentBranding() {
    var agent = (sample && sample.agent) || {};
    var base = agent.brokerage || {};
    var prefs = readPrefs() || {};
    var over = prefs.brokerage || {};
    return {
      name: over.name || base.name || "Brokerage",
      initials: (over.initials || base.initials || "LOGO").slice(0, 3),
      primary: over.primary || base.primary || "#1f4b6e",
      accent: over.accent || base.accent || "#d08c3a"
    };
  }

  function listings() {
    return (sample && sample.listings) || [];
  }

  function listingById(id) {
    var found = null;
    listings().forEach(function (item) {
      if (item.id === id) found = item;
    });
    return found;
  }

  function resolveListing() {
    var all = listings();
    var id = new URLSearchParams(window.location.search).get("listing");
    if (!id) return { listing: all[0] || null, missing: false };
    var found = listingById(id);
    if (!found) return { listing: null, missing: true };
    return { listing: found, missing: false };
  }

  function templateValues(listing) {
    var property = listing || {};
    var agent = agentProfile();
    var branding = agentBranding();
    var contact = (brand && brand.contact) || {};
    return {
      agentName: agent.fullName || "",
      agentEmail: agent.email || "",
      brokerage: branding.name || "",
      address: [property.addressLine1, property.addressLine2].filter(Boolean).join(", "),
      businessName: (brand && brand.businessName) || "",
      advisorName: contact.advisorName || "",
      email: contact.email || ""
    };
  }

  function messageHref() {
    var contact = (brand && brand.contact) || {};
    var subject = encodeURIComponent((brand && brand.messageSubject) || "Question about a project");
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
    var name = (brand && brand.businessName) || "VIP portal";
    var titles = {
      listings: "My Listings",
      project: "Listing",
      book: "Book Staging",
      packets: "Seller Packets",
      market: "Market Info",
      newsletter: "Staging ROI Newsletter",
      virtual: "Virtual Staging",
      billing: "Billing & Payments",
      account: "Account",
      document: "Document",
      forgot: "Forgot password"
    };
    if (page === "login" || !titles[page]) return "Sign in · " + name;
    return titles[page] + " · " + name;
  }

  function lookup(key) {
    if (!brand) return null;
    var contact = brand.contact || {};
    if (key === "tagline") return brand.tagline;
    if (key === "businessName") return brand.businessName;
    if (key === "portalLabel") return brand.portalLabel;
    if (key === "stagedBy") return brand.stagedBy;
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
      if (APP_PAGES[page]) {
        node.setAttribute("href", "listings.html");
        node.setAttribute("aria-label", "My Listings");
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

  function syncTopOffset() {
    var bar = document.querySelector(".topbar");
    if (!bar) return;
    document.documentElement.style.setProperty("--app-top", bar.offsetHeight + "px");
  }

  function initNav() {
    var sidebar = document.getElementById("sidebar");
    var tabbar = document.getElementById("tabbar");
    if (!sidebar && !tabbar) return;

    var current = document.body.getAttribute("data-nav") || page;
    var tabs = [];
    var more = [];
    NAV.forEach(function (item) {
      if (item.tab) tabs.push(item);
      else more.push(item);
    });

    if (sidebar) {
      var links = el("div", { class: "sidebar-links" });
      NAV.forEach(function (item) {
        if (item.id === "virtual") {
          links.appendChild(el("hr", { class: "nav-divider" }));
        }
        links.appendChild(el("a", {
          class: "nav-link",
          href: item.href,
          text: item.label,
          "aria-current": current === item.id ? "page" : null
        }));
      });
      var agent = agentProfile();
      sidebar.append(
        links,
        el("div", {
          class: "sidebar-foot",
          children: [
            el("p", { class: "sidebar-name", text: agent.fullName || "Sample member" }),
            el("p", { class: "sidebar-role", text: "Sample member" })
          ]
        })
      );
    }

    var sheet = document.getElementById("more-sheet");
    var backdrop = document.getElementById("more-backdrop");
    var moreButton = null;

    function setMore(open) {
      if (!sheet || !moreButton) return;
      var wasOpen = !sheet.hidden;
      sheet.hidden = !open;
      if (backdrop) backdrop.hidden = !open;
      moreButton.setAttribute("aria-expanded", open ? "true" : "false");
      if (!open && wasOpen) moreButton.focus();
    }

    if (tabbar) {
      tabs.forEach(function (item) {
        tabbar.appendChild(el("a", {
          class: "tab-link",
          href: item.href,
          text: item.short,
          "aria-label": item.label,
          "aria-current": current === item.id ? "page" : null
        }));
      });

      var moreCurrent = null;
      more.forEach(function (item) {
        if (item.id === current) moreCurrent = item;
      });

      moreButton = el("button", {
        class: moreCurrent ? "tab-more is-current" : "tab-more",
        type: "button",
        text: "More",
        "aria-expanded": "false",
        "aria-controls": "more-sheet",
        "aria-label": moreCurrent ? "More, " + moreCurrent.label + " selected" : "More"
      });
      tabbar.appendChild(moreButton);

      if (sheet) {
        more.forEach(function (item) {
          sheet.appendChild(el("a", {
            class: "nav-link",
            href: item.href,
            text: item.label,
            "aria-current": current === item.id ? "page" : null
          }));
        });
        moreButton.addEventListener("click", function () {
          setMore(sheet.hidden);
        });
      }
    }

    if (backdrop) {
      backdrop.addEventListener("click", function () {
        setMore(false);
      });
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setMore(false);
    });

    window.addEventListener("resize", function () {
      syncTopOffset();
      if (window.matchMedia("(min-width: 900px)").matches) setMore(false);
    });

    syncTopOffset();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(syncTopOffset);
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
      window.location.href = "listings.html";
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

  function initListings() {
    var line = document.getElementById("agent-line");
    var perks = document.getElementById("perks");
    var grid = document.getElementById("listing-grid");
    if (!sample || !grid) return;
    var agent = agentProfile();
    var branding = agentBranding();
    if (line) {
      var greeting = agent.firstName ? "Welcome back, " + agent.firstName + "." : "Welcome back.";
      line.textContent = [greeting, branding.name, "VIP member (sample)"].filter(Boolean).join(" · ");
    }
    if (perks) {
      (sample.perks || []).forEach(function (perk) {
        perks.appendChild(el("article", {
          class: "card perk",
          children: [
            el("h2", { text: perk.title }),
            el("p", { text: perk.text })
          ]
        }));
      });
    }
    listings().forEach(function (listing) {
      var address = [listing.addressLine1, listing.addressLine2].filter(Boolean).join(", ");
      var dateRows = (listing.dates || []).slice(0, 3).map(function (item) {
        return el("div", {
          children: [
            el("dt", { text: item.label }),
            el("dd", { text: formatShort(item.iso) })
          ]
        });
      });
      grid.appendChild(el("a", {
        class: "card listing-card",
        href: "dashboard.html?listing=" + encodeURIComponent(listing.id),
        children: [
          el("div", {
            class: "listing-media",
            children: [
              el("img", {
                src: listing.photo,
                alt: listing.photoAlt || address
              }),
              el("span", {
                class: "status-pill",
                text: (listing.status && listing.status.current) || "Sample"
              })
            ]
          }),
          el("div", {
            class: "listing-copy",
            children: [
              el("span", { class: "listing-address", text: listing.addressLine1 || "" }),
              el("span", { class: "listing-city", text: listing.addressLine2 || "" }),
              el("dl", { class: "card-dates", children: dateRows })
            ]
          })
        ]
      }));
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
          el("p", { class: "eyebrow", text: "Listing" }),
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
    var payChildren = balance > 0
      ? [
          el("button", {
            class: "btn",
            type: "button",
            disabled: true,
            "aria-describedby": "pay-note",
            text: "Pay now"
          }),
          el("p", { class: "coming-soon", id: "pay-note", text: "Coming soon" })
        ]
      : [el("p", { class: "coming-soon", text: "No balance on this sample invoice." })];

    host.append(
      el("h2", { text: "Quote & invoice" }),
      el("p", { class: "invoice-meta", text: meta }),
      invoice.vipNote ? el("p", { class: "vip-inline", text: invoice.vipNote }) : null,
      el("table", {
        class: "line-items",
        children: [
          el("tbody", {
            children: items.map(function (item) {
              return el("tr", {
                children: [
                  el("td", { text: item.label }),
                  el("td", { text: moneyOrIncluded(item.amount) })
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
      el("div", { class: "pay-row", children: payChildren }),
      el("p", {
        class: "pay-help",
        children: [
          document.createTextNode("Sample amounts. Nothing can be paid from this page. "),
          el("a", { href: "billing.html", text: "VIP pricing is on Billing & Payments." })
        ]
      })
    );
  }

  function renderGallery(gallery, note) {
    var host = document.getElementById("gallery");
    if (!host) return;
    if (!gallery || !gallery.length) {
      host.append(
        el("h2", { text: "Before & after" }),
        el("p", { class: "status-note", text: note || "No photos in this sample yet." })
      );
      return;
    }
    var pairs = gallery.map(function (pair) {
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
                    alt: photo.alt || caption
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

  function renderDocuments(documents, listing) {
    var host = document.getElementById("documents");
    if (!host) return;
    var list = el("ul", {
      class: "doc-list",
      children: (documents || []).map(function (doc) {
        var meta = [doc.status, doc.iso ? formatIsoDate(doc.iso) : ""].filter(Boolean).join(" · ");
        var href = "document.html?listing=" + encodeURIComponent(listing.id) + "&doc=" + encodeURIComponent(doc.id);
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
              href: href,
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
    var resolved = resolveListing();
    var listing = resolved.listing;
    if (!listing) {
      if (main) {
        main.append(
          el("p", { children: [el("a", { class: "back-link", href: "listings.html", text: "All listings" })] }),
          el("h1", { class: "welcome", text: "Listing not in this sample" }),
          el("p", { class: "client-line", text: "That link does not match a sample listing." })
        );
      }
      return;
    }
    var welcome = document.getElementById("welcome");
    var clientLine = document.getElementById("client-line");
    var agent = agentProfile();
    if (welcome) welcome.textContent = listing.addressLine1 || "Listing";
    if (clientLine) {
      clientLine.textContent = [
        listing.addressLine2,
        listing.status && listing.status.current ? "Current step: " + listing.status.current : "",
        agent.fullName
      ].filter(Boolean).join(" · ");
    }
    renderProperty(listing);
    renderStatus(listing.status);
    renderDates(listing.dates);
    renderInvoice(listing.invoice);
    renderGallery(listing.gallery, listing.galleryNote);
    renderDocuments(listing.documents, listing);
  }

  function findDocument(listingId, docId) {
    var all = listings();
    var i;
    var j;
    for (i = 0; i < all.length; i++) {
      if (listingId && all[i].id !== listingId) continue;
      var docs = all[i].documents || [];
      for (j = 0; j < docs.length; j++) {
        if (docs[j].id === docId) return { listing: all[i], doc: docs[j] };
      }
    }
    return null;
  }

  function initDocument() {
    var sheet = document.getElementById("doc-sheet");
    var back = document.getElementById("doc-back");
    if (!sheet) return;
    if (!sample) {
      sheet.appendChild(el("h1", { text: "Demo data is missing from this sample." }));
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var found = findDocument(params.get("listing"), params.get("doc"));

    if (!found) {
      if (back) back.setAttribute("href", "listings.html");
      var groups = listings().map(function (listing) {
        return el("section", {
          children: [
            el("h2", { text: listing.addressLine1 || "Listing" }),
            el("ul", {
              class: "doc-list",
              children: (listing.documents || []).map(function (item) {
                var href = "document.html?listing=" + encodeURIComponent(listing.id) + "&doc=" + encodeURIComponent(item.id);
                return el("li", {
                  children: [el("a", { href: href, text: item.title })]
                });
              })
            })
          ]
        });
      });
      sheet.append(el("h1", { text: "Sample documents" }), el("div", { children: groups }));
      return;
    }

    if (back) {
      back.setAttribute("href", "dashboard.html?listing=" + encodeURIComponent(found.listing.id) + "#documents");
      back.textContent = "Back to " + (found.listing.addressLine1 || "listing");
    }
    var values = templateValues(found.listing);
    var doc = found.doc;
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

  function showNote(id, text) {
    var node = document.getElementById(id);
    if (!node) return;
    node.hidden = false;
    node.textContent = text;
  }

  function initBook() {
    var form = document.getElementById("book-form");
    var select = document.getElementById("book-property");
    if (!form || !select || !sample) return;
    listings().forEach(function (listing) {
      select.appendChild(el("option", {
        value: listing.id,
        text: listing.addressLine1 + " — " + listing.addressLine2
      }));
    });
    select.appendChild(el("option", {
      value: "other",
      text: "A different property (sample)"
    }));
    var other = document.getElementById("other-property");
    function syncOther() {
      if (other) other.hidden = select.value !== "other";
    }
    select.addEventListener("change", syncOther);
    syncOther();
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      showNote("book-result", "Sample only. No booking was requested, and nothing was sent.");
    });
  }

  function inkFor(hex) {
    var h = String(hex || "").replace("#", "");
    if (h.length === 3) h = h.charAt(0) + h.charAt(0) + h.charAt(1) + h.charAt(1) + h.charAt(2) + h.charAt(2);
    if (!/^[0-9a-fA-F]{6}$/.test(h)) return "#ffffff";
    var y = (parseInt(h.slice(0, 2), 16) * 299 + parseInt(h.slice(2, 4), 16) * 587 + parseInt(h.slice(4, 6), 16) * 114) / 1000;
    return y > 160 ? "#1a1a1a" : "#ffffff";
  }

  function renderLockup(branding) {
    var contact = (brand && brand.contact) || {};
    var stagedBy = (brand && brand.stagedBy) || ("Staged by " + ((brand && brand.businessName) || "the stager"));
    var phone = contact.phoneDisplay || "";
    var email = contact.email || "";
    var broker = el("div", {
      class: "broker-pane",
      children: [
        el("p", { class: "pane-kicker", text: "Your brokerage" }),
        el("div", {
          class: "monogram",
          text: branding.initials || "LOGO",
          "aria-hidden": "true"
        }),
        el("p", { class: "broker-name", text: branding.name || "" }),
        el("p", { class: "logo-placeholder", text: "Logo placeholder" })
      ]
    });
    broker.style.background = branding.primary;
    broker.style.color = inkFor(branding.primary);
    broker.style.boxShadow = "inset 0 -6px 0 " + (branding.accent || "transparent");

    var house = el("div", {
      class: "house-pane",
      children: [
        el("img", {
          class: "packet-logo",
          src: (brand && brand.logoSrc) || "",
          alt: (brand && (brand.logoAlt || brand.businessName)) || ""
        }),
        el("p", { class: "staged-by", text: stagedBy }),
        el("p", { class: "packet-contact", text: [phone, email].filter(Boolean).join(" · ") })
      ]
    });

    return el("div", { class: "packet-lockup", children: [broker, house] });
  }

  function renderPacketPreview(typeId) {
    var host = document.getElementById("packet-preview");
    if (!host || !sample) return;
    var packets = sample.packets || [];
    var chosen = packets[0];
    packets.forEach(function (item) {
      if (item.id === typeId) chosen = item;
    });
    if (!chosen) return;
    var agent = agentProfile();
    var branding = agentBranding();
    host.textContent = "";
    host.appendChild(el("article", {
      class: "packet-sheet",
      children: [
        renderLockup(branding),
        el("div", {
          class: "packet-body",
          children: [
            el("p", { class: "stamp", text: "Sample" }),
            el("p", {
              class: "packet-prepared",
              text: "Prepared for sellers working with " + (agent.fullName || "the agent") + ", " + (branding.name || "the brokerage") + "."
            }),
            el("h2", { text: chosen.title }),
            el("p", { text: chosen.intro }),
            el("ul", {
              class: "packet-points",
              children: (chosen.points || []).map(function (point) {
                return el("li", { text: point });
              })
            })
          ]
        })
      ]
    }));
  }

  function initPackets() {
    var types = document.getElementById("packet-types");
    if (!types || !sample) return;
    var packets = sample.packets || [];
    packets.forEach(function (item, index) {
      var input = el("input", { type: "radio", name: "packet-type", value: item.id });
      if (index === 0) input.checked = true;
      input.addEventListener("change", function () {
        if (input.checked) renderPacketPreview(item.id);
      });
      types.appendChild(el("label", {
        class: "choice",
        children: [input, el("span", { text: item.title })]
      }));
    });
    if (packets[0]) renderPacketPreview(packets[0].id);
    var button = document.getElementById("download-packet");
    if (button) {
      button.addEventListener("click", function () {
        showNote("download-note", "Sample only. No PDF was created and nothing was saved or sent.");
      });
    }
  }

  function sumCounts(mix) {
    return (mix || []).reduce(function (sum, item) {
      return sum + (Number(item.count) || 0);
    }, 0);
  }

  function donutBackground(mix) {
    var total = sumCounts(mix);
    if (!total) return "var(--p-track)";
    var stops = [];
    var cursor = 0;
    mix.forEach(function (item) {
      var next = cursor + (item.count / total) * 100;
      stops.push(item.color + " " + cursor.toFixed(2) + "% " + next.toFixed(2) + "%");
      cursor = next;
    });
    return "conic-gradient(" + stops.join(", ") + ")";
  }

  function renderMarket(area) {
    var host = document.getElementById("market-report");
    if (!host || !area) return;
    host.textContent = "";
    var stats = [
      { label: "Active listings", value: String(area.active) },
      { label: "Median list price", value: money(area.medianList) },
      { label: "Median $ / sq ft", value: money(area.medianPpsf) },
      { label: "Median days on market", value: String(area.medianDom) },
      { label: "Sold last 30 days", value: String(area.sold30) },
      { label: "List-to-sale ratio", value: Number(area.listToSale).toFixed(1) + "%" }
    ];
    var statNodes = stats.map(function (stat) {
      return el("article", {
        class: "stat",
        children: [
          el("p", { class: "stat-label", text: stat.label }),
          el("p", { class: "stat-value", text: stat.value }),
          el("p", { class: "sample-flag", text: "Illustrative sample" })
        ]
      });
    });

    var maxMix = 0;
    (area.mix || []).forEach(function (item) {
      if (item.count > maxMix) maxMix = item.count;
    });
    var bars = (area.mix || []).map(function (item) {
      var pct = maxMix ? Math.round((item.count / maxMix) * 100) : 0;
      var fill = el("div", { class: "bar-fill" });
      fill.style.width = pct + "%";
      fill.style.background = item.color;
      return el("div", {
        class: "bar-row",
        children: [
          el("span", { class: "bar-label", text: item.label }),
          el("span", { class: "bar-count", text: String(item.count) }),
          el("div", { class: "bar-track", children: [fill] })
        ]
      });
    });

    var donut = el("div", {
      class: "donut",
      "aria-hidden": "true",
      children: [
        el("div", {
          class: "donut-hole",
          children: [
            el("span", { class: "donut-total", text: String(area.listed) }),
            el("span", { class: "donut-caption", text: "listed · sample" })
          ]
        })
      ]
    });
    donut.style.background = donutBackground(area.mix);

    var staged = area.roi.staged;
    var vacant = area.roi.vacant;
    var domDelta = vacant.dom - staged.dom;
    var ppsfDelta = staged.ppsf - vacant.ppsf;
    var roiSentence = "In this sample, staged median days on market are " +
      Math.abs(domDelta) + (domDelta >= 0 ? " lower" : " higher") +
      " than vacant, and the staged median price per square foot is " +
      money(Math.abs(ppsfDelta)) + (ppsfDelta >= 0 ? " higher" : " lower") +
      ". Illustrative only. Not a measured result for this ZIP.";

    var trendMax = 0;
    (area.trend || []).forEach(function (value) {
      if (value > trendMax) trendMax = value;
    });
    var trendCols = (area.trend || []).map(function (value, index) {
      var bar = el("div", { class: "trend-bar" });
      bar.style.height = (trendMax ? Math.round((value / trendMax) * 100) : 0) + "%";
      return el("div", {
        class: "trend-col",
        children: [
          el("span", { class: "trend-value", text: String(value) }),
          el("div", { class: "trend-plot", children: [bar] }),
          el("span", { class: "trend-label", text: String(index + 1) })
        ]
      });
    });

    host.append(
      el("div", {
        class: "report-head",
        children: [
          el("div", {
            children: [
              el("p", { class: "sample-ribbon", text: "Illustrative sample" }),
              el("h2", { text: area.zip + " " + area.city })
            ]
          }),
          el("p", {
            class: "status-note",
            text: "Sample classification of " + area.listed + " homes listed. Each fictional home is counted in one staging category. The bars, the donut, and the counts are the same made-up numbers."
          })
        ]
      }),
      el("div", { class: "stat-grid", children: statNodes }),
      el("h3", { class: "section-label", text: "Staging mix" }),
      el("div", {
        class: "chart-row",
        children: [
          donut,
          el("div", { class: "bars", children: bars })
        ]
      }),
      el("h3", { class: "section-label", text: "Staging comparison" }),
      el("div", {
        class: "roi-grid",
        children: [
          el("article", {
            class: "roi-card",
            children: [
              el("h3", { text: "Staged" }),
              el("p", { class: "stat-label", text: "Median days on market" }),
              el("p", { class: "stat-value", text: String(staged.dom) }),
              el("p", { class: "stat-label", text: "Median $ / sq ft" }),
              el("p", { class: "stat-value", text: money(staged.ppsf) }),
              el("p", { class: "sample-flag", text: "Illustrative sample" })
            ]
          }),
          el("article", {
            class: "roi-card",
            children: [
              el("h3", { text: "Vacant" }),
              el("p", { class: "stat-label", text: "Median days on market" }),
              el("p", { class: "stat-value", text: String(vacant.dom) }),
              el("p", { class: "stat-label", text: "Median $ / sq ft" }),
              el("p", { class: "stat-value", text: money(vacant.ppsf) }),
              el("p", { class: "sample-flag", text: "Illustrative sample" })
            ]
          })
        ]
      }),
      el("p", { class: "roi-read", text: roiSentence }),
      el("h3", { class: "section-label", text: "Inventory trend" }),
      el("p", {
        class: "status-note",
        text: "Months of supply across six sample months. Month 1 is the oldest month in this fake series. Not a real inventory history."
      }),
      el("div", {
        class: "trend",
        role: "img",
        "aria-label": "Sample inventory trend for " + area.zip,
        children: trendCols
      })
    );
  }

  function initMarket() {
    var select = document.getElementById("zip-select");
    var market = sample && sample.market;
    if (!select || !market) return;
    var banner = document.getElementById("market-disclaimer");
    if (banner && market.disclaimer) banner.textContent = market.disclaimer;
    var areas = market.areas || [];
    areas.forEach(function (area) {
      select.appendChild(el("option", {
        value: area.zip,
        text: area.zip + " " + area.city + " (sample)",
        selected: area.zip === "92054"
      }));
    });
    function show() {
      var chosen = areas[0];
      areas.forEach(function (area) {
        if (area.zip === select.value) chosen = area;
      });
      renderMarket(chosen);
    }
    select.addEventListener("change", show);
    show();
  }

  function initNewsletter() {
    var host = document.getElementById("issue");
    var issue = sample && sample.newsletter;
    if (host && issue) {
      host.append(
        el("p", { class: "sample-ribbon", text: issue.issueLabel || "Sample issue" }),
        el("p", { class: "issue-date", text: issue.dateLabel || "" }),
        el("h2", { text: issue.title || "" }),
        el("p", { class: "issue-dek", text: issue.dek || "" }),
        el("div", {
          children: (issue.sections || []).map(function (section) {
            return el("section", {
              class: "issue-section",
              children: [
                el("h3", { text: section.heading }),
                el("p", { text: section.body })
              ]
            });
          })
        })
      );
    }
    var button = document.getElementById("subscribe");
    var state = document.getElementById("subscribe-state");
    if (!button) return;
    var prefs = readPrefs() || {};
    var notes = prefs.notifications || {};
    function paint(on) {
      button.setAttribute("aria-checked", on ? "true" : "false");
      if (state) {
        state.textContent = on
          ? "On — sample only. You were not added to a list and no email will be sent."
          : "Off. This toggle does not subscribe you to anything.";
      }
    }
    paint(notes.newsletter != null ? !!notes.newsletter : false);
    button.addEventListener("click", function () {
      var on = button.getAttribute("aria-checked") !== "true";
      var next = readPrefs() || {};
      next.notifications = next.notifications || {};
      next.notifications.newsletter = on;
      writePrefs(next);
      paint(on);
    });
  }

  function shotFrame(photo, badge, caption) {
    return el("button", {
      class: "shot",
      type: "button",
      "data-photo": photo.src,
      "data-photo-alt": photo.alt || caption,
      "data-caption": caption,
      children: [
        el("span", {
          class: "shot-frame",
          children: [
            el("img", { src: photo.src, alt: photo.alt || caption }),
            el("span", { class: "virtual-badge" + (badge === "Original" ? " is-original" : ""), text: badge })
          ]
        }),
        el("span", { class: "shot-label", text: badge })
      ]
    });
  }

  function initVirtual() {
    var virtual = sample && sample.virtual;
    var pair = document.getElementById("virtual-pair");
    var free = document.getElementById("virtual-free");
    var disclosure = document.getElementById("virtual-disclosure");
    if (free && virtual) free.textContent = virtual.freeNote;
    if (disclosure && virtual) disclosure.textContent = virtual.disclosure;
    if (pair && virtual && virtual.example) {
      var example = virtual.example;
      pair.append(
        el("h2", { text: "Before & after" }),
        el("h3", { text: example.room || "Sample pair" }),
        el("div", {
          class: "pair-grid",
          children: [
            shotFrame(example.before, "Original", (example.room || "Room") + " — Original"),
            shotFrame(example.after, "Virtually staged", (example.room || "Room") + " — Virtually staged")
          ]
        })
      );
    }
    var input = document.getElementById("room-photo");
    var preview = document.getElementById("upload-preview");
    var note = document.getElementById("upload-note");
    if (!input || !preview) return;
    input.addEventListener("change", function () {
      var file = input.files && input.files[0];
      if (!file || String(file.type || "").indexOf("image/") !== 0) {
        preview.hidden = true;
        preview.removeAttribute("src");
        if (note) note.textContent = "Choose an image to preview it here. It is not uploaded.";
        return;
      }
      var reader = new FileReader();
      reader.onload = function () {
        preview.src = reader.result;
        preview.alt = "Local preview of the photo you chose. Not uploaded.";
        preview.hidden = false;
        if (note) note.textContent = "Preview only. This sample did not upload or alter the photo.";
      };
      reader.readAsDataURL(file);
    });
  }

  function lineTotal(lines, key) {
    return (lines || []).reduce(function (sum, line) {
      return sum + (Number(line[key]) || 0);
    }, 0);
  }

  function initBilling() {
    var host = document.getElementById("invoice-list");
    var billing = sample && sample.billing;
    if (!host || !billing) return;
    var intro = document.getElementById("billing-intro");
    if (intro) intro.textContent = billing.intro || "";
    (billing.invoices || []).forEach(function (invoice) {
      var vip = lineTotal(invoice.lines, "vip");
      var standard = lineTotal(invoice.lines, "standard");
      var paid = Number(invoice.paid) || 0;
      var balance = Math.max(vip - paid, 0);
      var issued = invoice.issued ? "Issued " + formatShort(invoice.issued) : "";
      var note = el("p", { class: "form-note", hidden: true });
      var pay = el("button", {
        class: "btn",
        type: "button",
        text: invoice.settled ? (paid > 0 ? "Paid (sample)" : "No balance (sample)") : "Pay (sample)",
        disabled: !!invoice.settled
      });
      if (!invoice.settled) {
        pay.addEventListener("click", function () {
          note.hidden = false;
          note.textContent = "Sample only. No payment was started and nothing was charged.";
        });
      }
      host.appendChild(el("article", {
        class: "card invoice-card",
        children: [
          el("div", {
            class: "invoice-card-head",
            children: [
              el("div", {
                children: [
                  el("h2", { text: invoice.address }),
                  el("p", {
                    class: "invoice-meta",
                    text: [invoice.id, invoice.status, issued].filter(Boolean).join(" · ")
                  })
                ]
              }),
              el("a", {
                class: "text-link",
                href: "dashboard.html?listing=" + encodeURIComponent(invoice.listingId),
                text: "View listing"
              })
            ]
          }),
          el("div", {
            class: "vip-lines",
            children: (invoice.lines || []).map(function (line) {
              return el("div", {
                class: "vip-line",
                children: [
                  el("p", { class: "vip-label", text: line.label }),
                  el("p", {
                    class: "vip-standard",
                    children: [
                      el("span", { class: "price-tag", text: "Standard" }),
                      el("span", { class: "was", text: money(line.standard) })
                    ]
                  }),
                  el("p", {
                    class: "vip-price",
                    children: [
                      el("span", { class: "price-tag", text: "VIP" }),
                      el("strong", { text: moneyOrIncluded(line.vip) })
                    ]
                  })
                ]
              });
            })
          }),
          el("dl", {
            class: "totals",
            children: [
              el("div", {
                children: [
                  el("dt", { text: "Standard subtotal" }),
                  el("dd", { class: "was", text: money(standard) })
                ]
              }),
              el("div", {
                children: [
                  el("dt", { text: "VIP subtotal" }),
                  el("dd", { text: money(vip) })
                ]
              }),
              el("div", {
                children: [
                  el("dt", { text: "Member savings (sample)" }),
                  el("dd", { text: money(Math.max(standard - vip, 0)) })
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
              pay,
              el("p", { class: "pay-help", text: "No card form. This button does not start a payment." })
            ]
          }),
          note
        ]
      }));
    });
  }

  function readBrandingForm() {
    var base = agentBranding();
    var name = document.getElementById("brokerage-name");
    var initials = document.getElementById("brokerage-initials");
    var primary = document.getElementById("brokerage-primary");
    var accent = document.getElementById("brokerage-accent");
    var nextInitials = initials && initials.value.trim() ? initials.value.trim().slice(0, 3).toUpperCase() : base.initials;
    return {
      name: name && name.value.trim() ? name.value.trim() : base.name,
      initials: nextInitials,
      primary: primary && primary.value ? primary.value : base.primary,
      accent: accent && accent.value ? accent.value : base.accent
    };
  }

  function paintAccountPreview() {
    var host = document.getElementById("brand-preview");
    if (!host) return;
    host.textContent = "";
    host.appendChild(renderLockup(readBrandingForm()));
  }

  function initAccount() {
    var form = document.getElementById("account-form");
    if (!form || !sample) return;
    var agent = agentProfile();
    var branding = agentBranding();
    var fields = {
      "agent-name": agent.fullName,
      "agent-email": agent.email,
      "agent-phone": agent.phone,
      "agent-license": agent.license,
      "brokerage-name": branding.name,
      "brokerage-initials": branding.initials
    };
    Object.keys(fields).forEach(function (id) {
      var node = document.getElementById(id);
      if (node) node.value = fields[id];
    });
    var primary = document.getElementById("brokerage-primary");
    var accent = document.getElementById("brokerage-accent");
    if (primary) primary.value = branding.primary;
    if (accent) accent.value = branding.accent;
    var notes = agent.notifications;
    [
      ["notify-projects", notes.projects],
      ["notify-invoices", notes.invoices],
      ["notify-newsletter", notes.newsletter],
      ["notify-booking", notes.booking]
    ].forEach(function (pair) {
      var box = document.getElementById(pair[0]);
      if (box) box.checked = !!pair[1];
    });
    paintAccountPreview();
    form.addEventListener("input", paintAccountPreview);
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var fullName = document.getElementById("agent-name").value.trim();
      var prefs = readPrefs() || {};
      prefs.profile = {
        fullName: fullName,
        firstName: fullName.split(/\s+/)[0] || "",
        email: document.getElementById("agent-email").value.trim(),
        phone: document.getElementById("agent-phone").value.trim(),
        license: document.getElementById("agent-license").value.trim()
      };
      prefs.brokerage = readBrandingForm();
      prefs.notifications = {
        projects: document.getElementById("notify-projects").checked,
        invoices: document.getElementById("notify-invoices").checked,
        newsletter: document.getElementById("notify-newsletter").checked,
        booking: document.getElementById("notify-booking").checked
      };
      writePrefs(prefs);
      showNote("account-result", "Saved in this browser for the demo. Nothing was sent to a server. Seller Packets will use this brokerage mark.");
    });
  }

  paintBrand();
  initNav();
  initLightbox();
  if (page === "login") initLogin();
  else if (page === "forgot") initForgot();
  else if (page === "listings") initListings();
  else if (page === "project") initDashboard();
  else if (page === "book") initBook();
  else if (page === "packets") initPackets();
  else if (page === "market") initMarket();
  else if (page === "newsletter") initNewsletter();
  else if (page === "virtual") initVirtual();
  else if (page === "billing") initBilling();
  else if (page === "account") initAccount();
  else if (page === "document") initDocument();
})();

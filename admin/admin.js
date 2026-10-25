/* Sample admin behavior. Business name, colors, logo, contact
   details, and the leads note come from brand.js. Demo content
   comes from sample-data.js. */
(function () {
  var brand = window.AdminBrand || {};
  var sample = window.AdminSample || null;
  var page = document.body.getAttribute("data-page") || "";
  var JOB_KEY = "admin-demo-job-status";
  var LEAD_KEY = "admin-demo-lead-status";
  var USER_KEY = "admin-demo-user";
  var memoryJobs = null;
  var memoryLeads = null;
  var flash = "";
  var calState = null;
  var virtualMode = "staging";
  var uploadPreviewUrl = "";
  var inventoryFilter = { placement: "all", category: "all" };

  var NAV = [
    { id: "week", href: "dashboard.html", label: "This week", short: "Week", tab: true },
    { id: "projects", href: "projects.html", label: "Projects", short: "Projects", tab: true },
    { id: "calendar", href: "calendar.html", label: "Calendar", short: "Calendar", tab: true },
    { id: "clients", href: "clients.html", label: "Clients", short: "Clients", tab: true },
    { id: "leads", href: "leads.html", label: "Leads", short: "Leads", group: "Pipeline" },
    { id: "rescue", href: "rescue.html", label: "Rescue leads", short: "Rescue" },
    { id: "opens", href: "open-houses.html", label: "Open houses", short: "Opens" },
    { id: "quotes", href: "quotes.html", label: "Quotes", short: "Quotes", group: "Office" },
    { id: "inventory", href: "inventory.html", label: "Inventory", short: "Inventory" },
    { id: "members", href: "members.html", label: "VIP members", short: "VIP" },
    { id: "marketing", href: "marketing.html", label: "Marketing", short: "Marketing", group: "Studio" },
    { id: "virtual", href: "virtual.html", label: "Virtual Stager", short: "Stager" }
  ];

  var JOB_STATUSES = [
    { id: "inquiry", label: "Inquiry" },
    { id: "quoted", label: "Quoted" },
    { id: "scheduled", label: "Scheduled" },
    { id: "staged", label: "Staged" },
    { id: "listed", label: "Listed" },
    { id: "sold", label: "Sold" },
    { id: "done", label: "De-staged/Done" }
  ];

  var LEAD_STATUSES = [
    { id: "new", label: "New" },
    { id: "contacted", label: "Contacted" },
    { id: "booked", label: "Booked" },
    { id: "dead", label: "Dead" }
  ];

  var APPT_TYPES = {
    stage: { label: "Staging", short: "Staging", icon: "fa-couch" },
    destage: { label: "De-stage / pickup", short: "Pickup", icon: "fa-truck" }
  };

  var WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

  function icon(name) {
    return el("i", { class: "fa-solid " + name, "aria-hidden": "true" });
  }

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function toIso(date) {
    return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
  }

  function parseIso(iso) {
    var parts = String(iso || "").split("-");
    if (parts.length !== 3) return null;
    var y = Number(parts[0]);
    var m = Number(parts[1]);
    var d = Number(parts[2]);
    if (!y || !m || !d) return null;
    var date = new Date(y, m - 1, d, 12, 0, 0, 0);
    if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
    return date;
  }

  function todayDate() {
    var now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);
  }

  function addDays(date, days) {
    var next = new Date(date.getTime());
    next.setDate(next.getDate() + days);
    return next;
  }

  function formatLong(date) {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    }).format(date);
  }

  function formatMedium(date) {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric"
    }).format(date);
  }

  function formatMonthDayYear(date) {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(date);
  }

  function formatDow(date) {
    return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date);
  }

  function formatMonthYear(date) {
    return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);
  }

  function formatMinutes(mins) {
    var h = Math.floor(mins / 60);
    var m = mins % 60;
    var suffix = h >= 12 ? "PM" : "AM";
    var h12 = h % 12;
    if (h12 === 0) h12 = 12;
    return h12 + ":" + pad(m) + " " + suffix;
  }

  function money(amount) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(Number(amount) || 0);
  }

  function isKnown(list, id) {
    return list.some(function (item) { return item.id === id; });
  }

  function statusLabel(list, id) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i].label;
    }
    return id;
  }

  function loadMap(key, cacheName) {
    if (cacheName === "jobs" && memoryJobs) return memoryJobs;
    if (cacheName === "leads" && memoryLeads) return memoryLeads;
    var map = {};
    try {
      var parsed = JSON.parse(localStorage.getItem(key) || "{}");
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) map = parsed;
    } catch (e) {
      map = {};
    }
    if (cacheName === "jobs") memoryJobs = map;
    if (cacheName === "leads") memoryLeads = map;
    return map;
  }

  function saveMap(key, map) {
    try {
      localStorage.setItem(key, JSON.stringify(map));
      return true;
    } catch (e) {
      return false;
    }
  }

  function clients() {
    return (sample && sample.clients) || [];
  }

  function jobs() {
    return (sample && sample.jobs) || [];
  }

  function appointments() {
    return (sample && sample.appointments) || [];
  }

  function leads() {
    return (sample && sample.leads) || [];
  }

  function clientById(id) {
    for (var i = 0; i < clients().length; i++) {
      if (clients()[i].id === id) return clients()[i];
    }
    return null;
  }

  function jobById(id) {
    for (var i = 0; i < jobs().length; i++) {
      if (jobs()[i].id === id) return jobs()[i];
    }
    return null;
  }

  function jobsFor(clientId) {
    return jobs().filter(function (job) { return job.clientId === clientId; });
  }

  function jobStatus(job) {
    var override = loadMap(JOB_KEY, "jobs")[job.id];
    if (isKnown(JOB_STATUSES, override)) return override;
    return job.status;
  }

  function leadStatus(lead) {
    var override = loadMap(LEAD_KEY, "leads")[lead.id];
    if (isKnown(LEAD_STATUSES, override)) return override;
    return lead.status;
  }

  function setStoredStatus(key, cacheName, id, status, original) {
    var map = loadMap(key, cacheName);
    if (status === original) delete map[id];
    else map[id] = status;
    return saveMap(key, map);
  }

  function setJobStatus(id, status) {
    var job = jobById(id);
    if (!job || !isKnown(JOB_STATUSES, status)) return false;
    if (jobStatus(job) === status) return false;
    var ok = setStoredStatus(JOB_KEY, "jobs", id, status, job.status);
    flash = ok ? "Status saved in this browser." : "Status updated for this visit only.";
    return true;
  }

  function setLeadStatus(id, status) {
    var lead = null;
    leads().forEach(function (item) {
      if (item.id === id) lead = item;
    });
    if (!lead || !isKnown(LEAD_STATUSES, status)) return false;
    if (leadStatus(lead) === status) return false;
    var ok = setStoredStatus(LEAD_KEY, "leads", id, status, lead.status);
    flash = ok ? "Status saved in this browser." : "Status updated for this visit only.";
    return true;
  }

  function resetStored() {
    memoryJobs = {};
    memoryLeads = {};
    try {
      localStorage.removeItem(JOB_KEY);
      localStorage.removeItem(LEAD_KEY);
    } catch (e) {}
    flash = "Demo changes cleared.";
  }

  function placeLine(job) {
    return [job.address, job.city, job.region].filter(Boolean).join(", ");
  }

  function priceLabel(job) {
    if (!job.amount) return "";
    if (job.invoicedOn) return "Invoiced " + money(job.amount);
    return "Quote " + money(job.amount);
  }

  function decorateAppt(appt) {
    var job = jobById(appt.jobId) || {};
    var client = clientById(job.clientId) || {};
    var type = APPT_TYPES[appt.type] || { label: "Appointment", short: "Appointment", icon: "fa-calendar-day" };
    return {
      id: appt.id,
      jobId: appt.jobId,
      iso: appt.date,
      date: parseIso(appt.date),
      minutes: appt.minutes || 0,
      time: formatMinutes(appt.minutes || 0),
      type: appt.type,
      typeLabel: type.label,
      shortLabel: type.short || type.label,
      icon: type.icon,
      note: appt.note || "",
      address: job.address || "",
      city: job.city || "",
      region: job.region || "",
      service: job.service || "",
      clientId: client.id || "",
      clientName: client.name || "",
      place: placeLine(job)
    };
  }

  function allAppts() {
    return appointments().map(decorateAppt).filter(function (appt) { return appt.date; });
  }

  function sortAppts(list) {
    return list.slice().sort(function (a, b) {
      if (a.iso !== b.iso) return a.iso < b.iso ? -1 : 1;
      return a.minutes - b.minutes;
    });
  }

  function apptsForJob(jobId) {
    return sortAppts(allAppts().filter(function (appt) { return appt.jobId === jobId; }));
  }

  function clientHref(id) {
    return "client.html?id=" + encodeURIComponent(id);
  }

  function calendarHref(iso) {
    return "calendar.html?on=" + encodeURIComponent(iso);
  }

  function rememberUser(label) {
    try {
      sessionStorage.setItem(USER_KEY, label);
    } catch (e) {}
  }

  function currentUser() {
    try {
      return sessionStorage.getItem(USER_KEY) || "";
    } catch (e) {
      return "";
    }
  }

  function currentNav() {
    var named = document.body.getAttribute("data-nav");
    if (named) return named;
    if (page === "dashboard") return "week";
    if (page === "client") return "clients";
    return page;
  }

  function daysSince(iso) {
    var date = parseIso(iso);
    if (!date) return null;
    return Math.round((todayDate().getTime() - date.getTime()) / 86400000);
  }

  function weekly() {
    return window.AdminWeekly || null;
  }

  function syncTopOffset() {
    var bar = document.querySelector(".topbar");
    if (!bar) return;
    document.documentElement.style.setProperty("--app-top", bar.offsetHeight + "px");
  }

  function quoteStatusLabel(status) {
    if (status === "accepted") return "Accepted";
    if (status === "declined") return "Declined";
    return "Sent";
  }

  function marketingStatusLabel(status) {
    if (status === "drafted") return "Drafted";
    if (status === "posted") return "Posted";
    return "Ready";
  }

  function contact() {
    return brand.contact || {};
  }

  function pageTitle(text) {
    document.title = text + (brand.businessName ? " · " + brand.businessName : "");
  }

  function paintStatic() {
    document.querySelectorAll("[data-fill='tagline']").forEach(function (node) {
      node.textContent = brand.tagline || "";
    });
  }

  function paintChrome() {
    var topbar = document.getElementById("topbar");
    var footer = document.getElementById("site-footer");
    if (!topbar || !footer) return;

    var banner = el("p", {
      class: "sample-banner",
      role: "note",
      text: (sample && sample.banner) || "Sample / demo data"
    });

    var logoLink = el("a", {
      class: "lockup",
      href: page === "login" ? (brand.publicSiteHref || "../") : "dashboard.html"
    });
    var logo = el("img", {
      class: "logo",
      src: brand.logoSrc || "",
      alt: brand.logoAlt || brand.businessName || "",
      width: "90",
      height: "42"
    });
    logoLink.append(logo, el("span", { class: "product-word", text: brand.productName || "Admin" }));
    logoLink.setAttribute("aria-label", (brand.businessName || "Home") + " " + (brand.productName || "admin"));

    var tools = el("div", { class: "header-tools" });
    if (contact().phoneDisplay) {
      tools.append(el("a", {
        class: "header-phone",
        href: "tel:" + (contact().phoneTel || ""),
        text: contact().phoneDisplay
      }));
    }
    if (page !== "login") {
      var who = currentUser();
      if (who) tools.append(el("span", { class: "who", text: who }));
      var signOut = el("a", { class: "btn btn-small btn-ghost", href: "index.html", text: "Sign out" });
      signOut.addEventListener("click", function () {
        try { sessionStorage.removeItem(USER_KEY); } catch (e) {}
      });
      tools.append(signOut);
    }

    var headerInner = el("div", { class: "header-inner", children: [logoLink, tools] });
    var header = el("header", { class: "site-header", children: [headerInner] });
    topbar.replaceChildren(banner, header);

    var phone = contact().phoneDisplay
      ? el("a", { href: "tel:" + (contact().phoneTel || ""), text: contact().phoneDisplay })
      : null;
    var email = contact().email
      ? el("a", { href: "mailto:" + contact().email, text: contact().email })
      : null;
    var contactLine = el("p");
    if (brand.businessName) contactLine.append(document.createTextNode(brand.businessName));
    if (phone) {
      if (contactLine.childNodes.length) contactLine.append(document.createTextNode(" · "));
      contactLine.append(phone);
    }
    if (email) {
      if (contactLine.childNodes.length) contactLine.append(document.createTextNode(" · "));
      contactLine.append(email);
    }
    footer.replaceChildren(
      contactLine,
      el("p", { text: brand.tagline || "" }),
      el("p", { text: "Demo only. No accounts are created." }),
      el("p", {
        children: [el("a", { href: brand.publicSiteHref || "../", text: brand.businessName || "Home" })]
      })
    );
  }

  function navLink(item, current, extraClass) {
    return el("a", {
      class: extraClass || "nav-link",
      href: item.href,
      text: extraClass === "tab-link" ? item.short : item.label,
      "aria-label": extraClass === "tab-link" ? item.label : null,
      "aria-current": current === item.id ? "page" : null
    });
  }

  function appendGrouped(container, items, current) {
    var lastGroup = "";
    items.forEach(function (item) {
      if (item.group && item.group !== lastGroup) {
        if (container.childNodes.length) container.append(el("hr", { class: "nav-divider" }));
        container.append(el("p", { class: "nav-label", text: item.group }));
        lastGroup = item.group;
      }
      container.append(navLink(item, current));
    });
  }

  function initNav() {
    var sidebar = document.getElementById("sidebar");
    var tabbar = document.getElementById("tabbar");
    if (!sidebar && !tabbar) return;

    var current = currentNav();
    var tabs = [];
    var more = [];
    NAV.forEach(function (item) {
      if (item.tab) tabs.push(item);
      else more.push(item);
    });

    if (sidebar) {
      var links = el("div", { class: "sidebar-links" });
      appendGrouped(links, NAV, current);
      sidebar.replaceChildren(
        links,
        el("div", {
          class: "sidebar-foot",
          children: [
            el("p", { class: "sidebar-name", text: brand.greetingName || "Sample owner" }),
            el("p", { class: "sidebar-role", text: "Sample owner" })
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
      tabbar.replaceChildren();
      tabs.forEach(function (item) {
        tabbar.append(navLink(item, current, "tab-link"));
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
      tabbar.append(moreButton);
      if (sheet) {
        sheet.replaceChildren();
        appendGrouped(sheet, more, current);
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

  function mount(nodes, opts) {
    opts = opts || {};
    var main = document.getElementById("main");
    if (!main) return;
    var y = window.scrollY;
    main.replaceChildren.apply(main, nodes);
    if (opts.keepScroll) window.scrollTo(0, y);
    if (opts.scrollToId) {
      var target = document.getElementById(opts.scrollToId);
      if (target && target.scrollIntoView) target.scrollIntoView({ block: "nearest" });
    }
  }

  function missingData() {
    mount([
      el("h1", { class: "page-title", text: "Demo data missing" }),
      el("p", { class: "card", text: "The sample file did not load." })
    ]);
  }

  function head(title, lede) {
    var block = el("div", { class: "page-head" });
    block.append(el("h1", { class: "page-title", text: title }));
    if (lede) block.append(el("p", { class: "lede", text: lede }));
    return block;
  }

  function weekStartIso() {
    return toIso(addDays(todayDate(), -6));
  }

  function newLeadsThisWeek() {
    var start = weekStartIso();
    var end = toIso(todayDate());
    return leads().filter(function (lead) {
      return lead.date && lead.date >= start && lead.date <= end;
    }).sort(function (a, b) {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return a.name.localeCompare(b.name);
    });
  }

  function upcomingAppts(type) {
    var todayIso = toIso(todayDate());
    return sortAppts(allAppts()).filter(function (appt) {
      return appt.type === type && appt.iso >= todayIso;
    });
  }

  function unpaidJobs() {
    return jobs().filter(function (job) {
      return job.invoicedOn && job.paid === false;
    });
  }

  function sectionHead(title, href, hrefLabel) {
    var row = el("div", { class: "section-row" });
    row.append(el("h2", { class: "section-title", text: title }));
    if (href) row.append(el("a", { class: "text-link", href: href, text: hrefLabel }));
    return row;
  }

  function agendaList(items, emptyText) {
    var list = el("div", { class: "agenda" });
    if (!items.length) {
      list.append(el("p", { class: "muted", text: emptyText }));
      return list;
    }
    items.forEach(function (appt) {
      var row = el("a", { class: "agenda-item", href: calendarHref(appt.iso) });
      var when = el("span", { class: "when" });
      when.append(el("span", { class: "dow", text: formatDow(appt.date) }), el("span", { text: formatMedium(appt.date) }));
      var body = el("span", { class: "agenda-body" });
      body.append(
        el("span", { class: "kicker", children: [icon(appt.icon), document.createTextNode(appt.typeLabel + " · " + appt.time)] }),
        el("span", { class: "address-line", text: appt.address }),
        el("span", { class: "muted", text: [appt.clientName, appt.city].filter(Boolean).join(" · ") })
      );
      var chevron = icon("fa-chevron-right");
      chevron.classList.add("chevron");
      row.append(when, body, chevron);
      list.append(row);
    });
    return list;
  }

  function renderDashboard() {
    pageTitle("This week");
    var helloName = brand.greetingName || "";
    var title = helloName ? "Hello, " + helloName : "This week";
    var fresh = newLeadsThisWeek();
    var installs = upcomingAppts("stage");
    var destages = upcomingAppts("destage");
    var unpaid = unpaidJobs();

    var stats = el("div", { class: "stats" });
    stats.append(
      statCard("fa-inbox", String(fresh.length), "New leads this week", "Inquiries from the last 7 days", "leads.html"),
      statCard("fa-couch", String(installs.length), "Upcoming installs", "Staging days still ahead", installs.length ? calendarHref(installs[0].iso) : "calendar.html"),
      statCard("fa-truck", String(destages.length), "Upcoming destages", "Pickups still ahead", destages.length ? calendarHref(destages[0].iso) : "calendar.html"),
      statCard("fa-file-invoice-dollar", String(unpaid.length), "Unpaid invoices", "Sample invoices marked unpaid", "#unpaid")
    );

    var leadList = el("div", { class: "stack-list" });
    if (!fresh.length) leadList.append(el("p", { class: "muted", text: "No new sample leads in the last 7 days." }));
    fresh.forEach(function (lead) {
      var row = el("a", { class: "link-row", href: "leads.html" });
      row.append(
        el("span", { class: "row-title", text: lead.name }),
        el("span", { class: "muted", text: [lead.property, lead.date && parseIso(lead.date) ? formatMonthDayYear(parseIso(lead.date)) : ""].filter(Boolean).join(" · ") })
      );
      leadList.append(row);
    });

    var billList = el("div", { class: "stack-list" });
    if (!unpaid.length) billList.append(el("p", { class: "muted", text: "No unpaid sample invoices." }));
    unpaid.forEach(function (job) {
      var client = clientById(job.clientId);
      var row = el("a", { class: "link-row", href: client ? clientHref(client.id) : "clients.html" });
      var when = job.invoicedOn && parseIso(job.invoicedOn) ? formatMonthDayYear(parseIso(job.invoicedOn)) : "";
      row.append(
        el("span", { class: "row-title", text: job.address }),
        el("span", { class: "muted", text: [client ? client.name : "", money(job.amount), when].filter(Boolean).join(" · ") })
      );
      billList.append(row);
    });

    mount([
      head(title, "This week in the sample book. Leads, installs, destages, and unpaid invoices."),
      stats,
      el("div", { class: "week-grid", children: [
        el("section", { class: "card", children: [
          sectionHead("New leads", "leads.html", "Open leads"),
          leadList
        ]}),
        el("section", { class: "card", children: [
          sectionHead("Upcoming installs", installs.length ? calendarHref(installs[0].iso) : "calendar.html", "Open calendar"),
          agendaList(installs, "No upcoming installs in the sample calendar.")
        ]}),
        el("section", { class: "card", children: [
          sectionHead("Upcoming destages", destages.length ? calendarHref(destages[0].iso) : "calendar.html", "Open calendar"),
          agendaList(destages, "No upcoming destages in the sample calendar.")
        ]}),
        el("section", { class: "card", id: "unpaid", children: [
          sectionHead("Unpaid invoices", unpaid.length && clientById(unpaid[0].clientId) ? clientHref(unpaid[0].clientId) : "clients.html", "Open a client"),
          billList
        ]})
      ]})
    ]);
  }

  function statCard(iconName, value, label, note, href) {
    var card = el(href ? "a" : "div", { class: "card stat" });
    if (href) card.setAttribute("href", href);
    card.append(
      el("span", { class: "stat-icon", children: [icon(iconName)] }),
      el("span", { class: "stat-value", text: value }),
      el("span", { class: "stat-label", text: label }),
      el("span", { class: "stat-note", text: note })
    );
    return card;
  }

  function renderClients() {
    pageTitle("Clients");
    var list = el("div", { class: "client-list" });
    clients().slice().sort(function (a, b) {
      return a.name.localeCompare(b.name);
    }).forEach(function (client) {
      var related = jobsFor(client.id);
      var cities = [];
      related.forEach(function (job) {
        if (job.city && cities.indexOf(job.city) === -1) cities.push(job.city);
      });
      var card = el("a", { class: "card client-card", href: clientHref(client.id) });
      var chevron = icon("fa-chevron-right");
      chevron.classList.add("chevron");
      card.append(
        el("span", { class: "client-name", text: client.name }),
        el("span", { class: "client-role", text: [client.role, client.company].filter(Boolean).join(" · ") }),
        el("span", { class: "client-jobs", text: related.length + (related.length === 1 ? " job" : " jobs") + (cities.length ? " · " + cities.join(", ") : "") }),
        chevron
      );
      list.append(card);
    });
    mount([
      head("Clients", "Sample clients. Open one for contact details, property, jobs, and notes."),
      list
    ]);
  }

  function jobArticle(job) {
    var article = el("article", { class: "card job" });
    var top = el("div", { class: "job-top" });
    top.append(el("span", { class: "badge", text: statusLabel(JOB_STATUSES, jobStatus(job)) }), el("span", { class: "service", text: job.service }));
    article.append(top, el("h3", { text: placeLine(job) }));
    var related = apptsForJob(job.id);
    if (related.length) {
      var dates = el("p", { class: "fine" });
      related.forEach(function (appt, index) {
        if (index) dates.append(document.createTextNode(" · "));
        dates.append(document.createTextNode(appt.typeLabel + " " + formatMonthDayYear(appt.date)));
      });
      article.append(dates);
    }
    if (priceLabel(job)) {
      var price = priceLabel(job);
      if (job.invoicedOn && parseIso(job.invoicedOn)) price += " on " + formatMonthDayYear(parseIso(job.invoicedOn));
      article.append(el("p", { class: "price", text: price }));
    }
    if (job.note) article.append(el("p", { text: job.note }));
    return article;
  }

  function renderClient() {
    var params = new URLSearchParams(window.location.search);
    var client = clientById(params.get("id"));
    if (!client) {
      pageTitle("Client");
      mount([
        el("a", { class: "back", href: "clients.html", children: [icon("fa-arrow-left"), document.createTextNode("Clients")] }),
        head("Client", ""),
        el("p", { class: "card", text: "That sample client is not in the demo." })
      ]);
      return;
    }
    pageTitle(client.name);
    var related = jobsFor(client.id).slice().sort(function (a, b) {
      var rank = { inquiry: 0, quoted: 1, scheduled: 2, staged: 3, listed: 4, sold: 5, done: 6 };
      return (rank[jobStatus(a)] || 0) - (rank[jobStatus(b)] || 0);
    });
    var current = related.filter(function (job) { return jobStatus(job) !== "done"; });
    var past = related.filter(function (job) { return jobStatus(job) === "done"; });

    var contactCard = el("section", { class: "card", children: [el("h2", { class: "section-title", text: "Contact" })] });
    contactCard.append(el("p", { class: "muted", text: [client.role, client.company].filter(Boolean).join(" · ") }));
    if (client.phone) {
      contactCard.append(el("p", { class: "contact-line", children: [
        icon("fa-phone"),
        el("a", { href: "tel:" + (client.phoneTel || ""), text: client.phone })
      ]}));
    }
    if (client.email) {
      contactCard.append(el("p", { class: "contact-line", children: [
        icon("fa-envelope"),
        el("a", { href: "mailto:" + client.email, text: client.email })
      ]}));
    }

    var properties = [];
    related.forEach(function (job) {
      var line = placeLine(job);
      if (line && properties.indexOf(line) === -1) properties.push(line);
    });
    var propertyCard = el("section", { class: "card", children: [
      el("h2", { class: "section-title", text: properties.length === 1 ? "Property" : "Properties" })
    ]});
    if (!properties.length) {
      propertyCard.append(el("p", { class: "muted", text: "No property in this sample." }));
    }
    properties.forEach(function (line) {
      propertyCard.append(el("p", { class: "contact-line", children: [icon("fa-location-dot"), document.createTextNode(line)] }));
    });

    var notes = el("section", { class: "card", children: [
      el("h2", { class: "section-title", text: "Notes" }),
      el("p", { text: client.notes || "No notes in this sample." })
    ]});

    var nodes = [
      el("a", { class: "back", href: "clients.html", children: [icon("fa-arrow-left"), document.createTextNode("Clients")] }),
      head(client.name, ""),
      el("div", { class: "detail-grid", children: [contactCard, propertyCard] }),
      notes
    ];

    function jobSection(label, items) {
      if (!items.length) return;
      nodes.push(el("h2", { class: "section-title", text: label }));
      var list = el("div", { class: "job-list" });
      items.forEach(function (job) { list.append(jobArticle(job)); });
      nodes.push(list);
    }

    jobSection("Current jobs", current);
    jobSection("Past jobs", past);
    mount(nodes);
  }

  function ensureCal() {
    if (calState) return calState;
    var params = new URLSearchParams(window.location.search);
    var requested = parseIso(params.get("on"));
    var selected = requested;
    if (!selected) {
      var todayIso = toIso(todayDate());
      var upcoming = sortAppts(allAppts()).filter(function (appt) { return appt.iso >= todayIso; });
      selected = upcoming.length ? upcoming[0].date : todayDate();
    }
    calState = {
      year: selected.getFullYear(),
      month: selected.getMonth(),
      selected: toIso(selected)
    };
    return calState;
  }

  function shiftMonth(delta) {
    var state = ensureCal();
    var next = new Date(state.year, state.month + delta, 1, 12, 0, 0, 0);
    state.year = next.getFullYear();
    state.month = next.getMonth();
    var selected = parseIso(state.selected);
    if (!selected || selected.getFullYear() !== state.year || selected.getMonth() !== state.month) {
      var inMonth = sortAppts(allAppts()).filter(function (appt) {
        return appt.date.getFullYear() === state.year && appt.date.getMonth() === state.month;
      });
      state.selected = inMonth.length ? inMonth[0].iso : toIso(next);
    }
  }

  function renderCalendar(opts) {
    pageTitle("Calendar");
    var state = ensureCal();
    var todayIso = toIso(todayDate());
    var monthDate = new Date(state.year, state.month, 1, 12, 0, 0, 0);
    var daysInMonth = new Date(state.year, state.month + 1, 0).getDate();
    var startPad = monthDate.getDay();

    var prev = el("button", { class: "icon-btn", type: "button", "aria-label": "Previous month" });
    prev.append(icon("fa-chevron-left"));
    prev.addEventListener("click", function () {
      shiftMonth(-1);
      renderCalendar();
    });
    var next = el("button", { class: "icon-btn", type: "button", "aria-label": "Next month" });
    next.append(icon("fa-chevron-right"));
    next.addEventListener("click", function () {
      shiftMonth(1);
      renderCalendar();
    });
    var nav = el("div", { class: "cal-nav", children: [
      prev,
      el("h2", { text: formatMonthYear(monthDate) }),
      next
    ]});

    var legend = el("p", { class: "legend" });
    legend.append(
      el("span", { children: [el("i", { class: "dot", "aria-hidden": "true" }), document.createTextNode("Staging")] }),
      el("span", { children: [el("i", { class: "dot destage", "aria-hidden": "true" }), document.createTextNode("De-stage / pickup")] })
    );

    var weekdays = el("div", { class: "weekdays" });
    WEEKDAYS.forEach(function (day) { weekdays.append(el("span", { text: day })); });

    var grid = el("div", { class: "cal-grid" });
    for (var padIndex = 0; padIndex < startPad; padIndex++) {
      grid.append(el("span", { class: "day-empty" }));
    }
    for (var dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      var date = new Date(state.year, state.month, dayNum, 12, 0, 0, 0);
      var iso = toIso(date);
      var events = sortAppts(allAppts()).filter(function (appt) { return appt.iso === iso; });
      var button = el("button", { class: "day", type: "button" });
      if (iso === state.selected) button.classList.add("is-selected");
      if (iso === todayIso) button.classList.add("is-today");
      var summary = formatLong(date);
      if (!events.length) summary += ", no appointments";
      else summary += ", " + events.map(function (appt) { return appt.typeLabel + " " + appt.time; }).join(", ");
      button.setAttribute("aria-label", summary);
      button.setAttribute("aria-pressed", iso === state.selected ? "true" : "false");
      var pills = el("span", { class: "day-pills" });
      var dots = el("span", { class: "dots" });
      events.forEach(function (appt) {
        pills.append(el("span", { class: "pill" + (appt.type === "destage" ? " destage" : ""), text: appt.shortLabel }));
        dots.append(el("i", { class: "dot" + (appt.type === "destage" ? " destage" : ""), "aria-hidden": "true" }));
      });
      button.append(el("span", { class: "num", text: String(dayNum) }), pills, dots);
      (function (selectedIso) {
        button.addEventListener("click", function () {
          state.selected = selectedIso;
          renderCalendar({ scrollToId: "day-detail" });
        });
      })(iso);
      grid.append(button);
    }

    var selectedDate = parseIso(state.selected) || monthDate;
    var selectedEvents = sortAppts(allAppts()).filter(function (appt) { return appt.iso === state.selected; });
    var detail = el("section", { class: "card", id: "day-detail" });
    detail.append(el("h2", { class: "section-title", text: formatLong(selectedDate) }));
    if (!selectedEvents.length) {
      detail.append(el("p", { class: "muted", text: "Nothing scheduled this day." }));
    } else {
      var eventList = el("div", { class: "day-events" });
      selectedEvents.forEach(function (appt) {
        var article = el("article");
        article.append(el("p", { class: "kicker", children: [icon(appt.icon), document.createTextNode(appt.typeLabel + " · " + appt.time)] }));
        article.append(el("h3", { text: appt.place || appt.address }));
        if (appt.service) article.append(el("p", { text: appt.service }));
        if (appt.clientName) {
          article.append(el("p", { children: [el("a", { href: clientHref(appt.clientId), text: appt.clientName })] }));
        }
        if (appt.note) article.append(el("p", { class: "muted", text: appt.note }));
        eventList.append(article);
      });
      detail.append(eventList);
    }

    var monthCard = el("section", { class: "card", children: [nav, legend, weekdays, grid] });
    mount([
      head("Calendar", "Stagings and de-stage pickups. Choose a day to see the details."),
      el("div", { class: "cal-layout", children: [monthCard, detail] })
    ], opts);
  }

  function statusSelect(list, current, labelText, onChange) {
    var label = el("label", { class: "status-field" });
    label.append(el("span", { class: "status-caption", text: "Status" }), el("span", { class: "sr", text: " " + labelText }));
    var select = el("select");
    list.forEach(function (status) {
      var option = el("option", { value: status.id, text: status.label });
      if (status.id === current) option.selected = true;
      select.append(option);
    });
    select.addEventListener("change", function () { onChange(select.value); });
    label.append(select);
    return label;
  }

  function renderProjects(opts) {
    pageTitle("Projects");
    var board = el("div", { class: "board" });
    JOB_STATUSES.forEach(function (status) {
      var items = jobs().filter(function (job) { return jobStatus(job) === status.id; });
      var column = el("section", { class: "column", "aria-label": status.label });
      column.append(el("h2", {
        children: [
          document.createTextNode(status.label),
          el("span", { class: "count", text: String(items.length) })
        ]
      }));
      var body = el("div", { class: "column-body" });
      if (!items.length) body.append(el("p", { class: "empty", text: "No jobs" }));
      items.forEach(function (job) {
        var client = clientById(job.clientId);
        var card = el("article", { class: "job-card" });
        var handle = el("span", {
          class: "drag-handle",
          draggable: "true",
          title: "Drag to another column",
          "aria-hidden": "true"
        });
        handle.append(icon("fa-grip-vertical"));
        handle.addEventListener("dragstart", function (event) {
          event.dataTransfer.setData("text/plain", job.id);
          event.dataTransfer.effectAllowed = "move";
          card.classList.add("is-dragging");
        });
        handle.addEventListener("dragend", function () {
          card.classList.remove("is-dragging");
        });
        var top = el("div", { class: "card-top", children: [handle, el("p", { class: "service", text: job.service })] });
        card.append(top);
        card.append(el("a", { class: "address-line", href: clientHref(job.clientId), text: job.address }));
        card.append(el("p", { class: "fine", text: [client ? client.name : "", job.city].filter(Boolean).join(" · ") }));
        if (priceLabel(job)) card.append(el("p", { class: "price", text: priceLabel(job) }));
        card.append(statusSelect(JOB_STATUSES, status.id, "for " + job.address, function (value) {
          if (setJobStatus(job.id, value)) renderProjects({ keepScroll: true });
        }));
        body.append(card);
      });
      column.append(body);
      column.addEventListener("dragover", function (event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        column.classList.add("is-over");
      });
      column.addEventListener("dragleave", function (event) {
        if (!column.contains(event.relatedTarget)) column.classList.remove("is-over");
      });
      column.addEventListener("drop", function (event) {
        event.preventDefault();
        column.classList.remove("is-over");
        var id = event.dataTransfer.getData("text/plain");
        if (id && setJobStatus(id, status.id)) renderProjects({ keepScroll: true });
      });
      board.append(column);
    });

    var reset = el("button", { class: "btn btn-small btn-ghost", type: "button", text: "Reset demo changes" });
    reset.addEventListener("click", function () {
      resetStored();
      renderProjects({ keepScroll: true });
    });
    var toolbar = el("div", { class: "toolbar", children: [
      el("p", { class: "fine", text: "Change a status with the list on the card. On a wide screen you can also drag the grip. Changes stay in this browser." }),
      reset
    ]});
    mount([
      head("Projects", "Each sample job, from inquiry to done."),
      el("p", { class: "flash", role: "status", text: flash }),
      toolbar,
      board
    ], opts);
  }

  function renderLeads(opts) {
    pageTitle("Leads");
    var note = brand.leadsNote || "This inbox is a quick view, not a sales pipeline.";
    var callout = el("aside", { class: "card callout" });
    callout.append(icon("fa-circle-info"), el("p", { text: note }));

    var counts = {};
    LEAD_STATUSES.forEach(function (status) { counts[status.id] = 0; });
    var ordered = leads().slice().sort(function (a, b) {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return a.name.localeCompare(b.name);
    });
    ordered.forEach(function (lead) {
      var statusId = leadStatus(lead);
      counts[statusId] = (counts[statusId] || 0) + 1;
    });
    var countRow = el("p", { class: "counts" });
    LEAD_STATUSES.forEach(function (status) {
      countRow.append(el("span", { text: counts[status.id] + " " + status.label.toLowerCase() }));
    });

    var list = el("div", { class: "lead-list" });
    ordered.forEach(function (lead) {
      var current = leadStatus(lead);
      var card = el("article", { class: "card lead" });
      var main = el("div");
      main.append(el("h2", { text: lead.name }));
      var meta = [lead.source, lead.date && parseIso(lead.date) ? formatMonthDayYear(parseIso(lead.date)) : ""].filter(Boolean).join(" · ");
      main.append(el("p", { class: "fine", text: meta }));
      if (lead.property) {
        main.append(el("p", { class: "contact-line", children: [icon("fa-location-dot"), document.createTextNode(lead.property)] }));
      }
      if (lead.message) main.append(el("p", { class: "lead-message", text: lead.message }));
      card.append(main, statusSelect(LEAD_STATUSES, current, "for " + lead.name, function (value) {
        if (setLeadStatus(lead.id, value)) renderLeads({ keepScroll: true });
      }));
      list.append(card);
    });

    var reset = el("button", { class: "btn btn-small btn-ghost", type: "button", text: "Reset demo changes" });
    reset.addEventListener("click", function () {
      resetStored();
      renderLeads({ keepScroll: true });
    });

    mount([
      head("Leads", "New inquiries in this sample. Not the CRM."),
      callout,
      el("p", { class: "flash", role: "status", text: flash }),
      el("div", { class: "toolbar", children: [
        el("p", { class: "fine", text: "Status changes stay in this browser until you reset the demo." }),
        reset
      ]}),
      countRow,
      list
    ], opts);
  }

  function refreshedLine() {
    var data = weekly();
    if (!data) return "Sample list. A weekly file can replace this data.";
    return "Last refreshed: " + (data.refreshedLabel || "sample date") + " · " + (data.cadence || "updates weekly");
  }

  function renderRescue() {
    pageTitle("Rescue leads");
    var data = weekly();
    var groups = [
      { id: "vacant", title: "Fully vacant" },
      { id: "virtual", title: "Virtually staged" },
      { id: "stale", title: "Stale or lived-in" }
    ];
    var nodes = [
      head("Rescue staging leads", "Sample listings that look vacant, virtually staged, or stale. Not a live search."),
      el("p", { class: "fine", text: refreshedLine() })
    ];
    if (!data || !data.rescue) {
      nodes.push(el("p", { class: "card", text: "The weekly sample file did not load." }));
      mount(nodes);
      return;
    }
    groups.forEach(function (group) {
      var items = data.rescue.filter(function (item) { return item.category === group.id; });
      var list = el("div", { class: "rescue-list" });
      if (!items.length) list.append(el("p", { class: "muted", text: "None in this sample." }));
      items.forEach(function (item) {
        var card = el("article", { class: "card rescue-card" });
        if (item.photo) {
          card.append(el("img", { class: "thumb", src: item.photo, alt: item.photoAlt || "" }));
        }
        var body = el("div");
        body.append(el("h3", { text: item.address }));
        body.append(el("p", { class: "fine", text: item.city || "" }));
        var facts = [
          item.price ? money(item.price) : "",
          item.beds != null ? item.beds + " bd" : "",
          item.baths != null ? item.baths + " ba" : "",
          item.sqft ? Number(item.sqft).toLocaleString("en-US") + " sq ft" : "",
          item.daysOnMarket != null ? item.daysOnMarket + " days on market" : ""
        ].filter(Boolean).join(" · ");
        body.append(el("p", { text: facts }));
        if (item.note) body.append(el("p", { text: item.note }));
        body.append(el("p", { class: "fine", text: [item.agent, item.brokerage, item.phone].filter(Boolean).join(" · ") }));
        var redfin = el("a", { class: "btn btn-small btn-ghost", href: "#", text: "Redfin listing (sample placeholder)" });
        redfin.addEventListener("click", function (event) { event.preventDefault(); });
        body.append(redfin);
        card.append(body);
        list.append(card);
      });
      nodes.push(el("h2", { class: "section-title", text: group.title }), list);
    });
    mount(nodes);
  }

  function renderOpenHouses() {
    pageTitle("Open houses");
    var data = weekly();
    var nodes = [
      head("Open house leads", "Sample open houses this weekend. Addresses and agents are fictional."),
      el("p", { class: "fine", text: refreshedLine() })
    ];
    if (!data || !data.openHouses) {
      nodes.push(el("p", { class: "card", text: "The weekly sample file did not load." }));
      mount(nodes);
      return;
    }
    var list = el("div", { class: "rescue-list" });
    data.openHouses.forEach(function (item) {
      var card = el("article", { class: "card" });
      card.append(el("h2", { text: item.address }));
      card.append(el("p", { class: "fine", text: item.city || "" }));
      card.append(el("p", { text: [item.when, item.time].filter(Boolean).join(" · ") }));
      card.append(el("p", { class: "fine", text: [item.agent, item.brokerage, item.phone].filter(Boolean).join(" · ") }));
      card.append(el("div", {
        class: "map-placeholder",
        role: "img",
        "aria-label": "Map placeholder",
        text: "Map placeholder. No map is loaded in this sample."
      }));
      list.append(card);
    });
    nodes.push(list);
    mount(nodes);
  }

  function renderVirtual() {
    pageTitle("Virtual Stager");
    var pack = (sample && sample.virtual) || {};
    var modeBtn = el("button", {
      class: "btn",
      type: "button",
      text: virtualMode === "markup" ? "Virtual staging" : "Markup mode"
    });
    modeBtn.addEventListener("click", function () {
      virtualMode = virtualMode === "markup" ? "staging" : "markup";
      renderVirtual();
    });

    var file = el("input", { class: "file-input", id: "room-photo", type: "file", accept: "image/*" });
    file.addEventListener("change", function () {
      var chosen = file.files && file.files[0];
      if (!chosen) return;
      var reader = new FileReader();
      reader.onload = function () {
        uploadPreviewUrl = String(reader.result || "");
        renderVirtual();
      };
      reader.readAsDataURL(chosen);
    });
    var fileLabel = el("label", { class: "btn btn-ghost", for: "room-photo", text: "Choose a room photo" });
    var upload = el("div", { class: "upload-mock", children: [
      file,
      fileLabel,
      el("p", { class: "fine", text: "The photo stays in this browser. Nothing is uploaded." })
    ]});
    if (uploadPreviewUrl) {
      upload.append(el("img", {
        id: "upload-preview",
        src: uploadPreviewUrl,
        alt: "Room photo chosen on this device"
      }));
    }

    var nodes = [
      head("Virtual Stager", "A local sample. It does not call an image service."),
      el("div", { class: "toolbar", children: [modeBtn, el("p", { class: "fine", text: virtualMode === "markup" ? "Markup mode shows a stored sample board." : "Virtual staging shows a labeled sample pair." })] })
    ];

    if (virtualMode === "markup") {
      var board = el("section", { class: "card" });
      board.append(el("h2", { class: "section-title", text: "Staging suggestions" }));
      board.append(el("img", {
        class: "markup-shot",
        src: pack.markupSrc || "",
        alt: pack.markupAlt || "Sample staging suggestions board"
      }));
      board.append(el("p", {
        class: "fine",
        text: "Sample board stored with this demo. It is not generated from the photo above."
      }));
      board.append(el("p", { class: "fine", text: "Concept layout only. Verify dimensions and clearances on site." }));
      nodes.push(upload, board);
    } else {
      var pair = el("div", { class: "pair" });
      var before = el("figure", { class: "shot" });
      var beforeFrame = el("span", { class: "shot-frame" });
      beforeFrame.append(
        el("img", { src: pack.before || "", alt: pack.beforeAlt || "Original room photo" }),
        el("span", { class: "virtual-badge is-original", text: "Original" })
      );
      before.append(beforeFrame, el("figcaption", { text: "Original" }));
      var after = el("figure", { class: "shot" });
      var afterFrame = el("span", { class: "shot-frame" });
      afterFrame.append(
        el("img", { src: pack.after || "", alt: pack.afterAlt || "Sample staged photo" }),
        el("span", { class: "virtual-badge", text: "Virtually staged" })
      );
      after.append(afterFrame, el("figcaption", { text: "Virtually staged" }));
      pair.append(before, after);
      var staging = el("section", { class: "card", children: [
        el("h2", { class: "section-title", text: "Sample result" }),
        el("p", { class: "fine", text: "The after photo is a portfolio image used to show the label. It is not an edit of the upload." }),
        pair,
        el("p", { text: pack.disclosure || "" })
      ]});
      nodes.push(upload, staging);
    }

    nodes.push(el("p", { class: "fine", text: "Markups can also be requested by email." }));
    mount(nodes);
  }

  function inventoryItems() {
    return (sample && sample.inventory) || [];
  }

  function inventoryWhere(item) {
    if (item.placement === "warehouse") return "In warehouse";
    var until = item.until && parseIso(item.until) ? formatMonthDayYear(parseIso(item.until)) : "";
    var home = item.home || "a sample home";
    return until ? "At " + home + " until " + until : "At " + home;
  }

  function renderInventory() {
    pageTitle("Inventory");
    var items = inventoryItems();
    var categories = ["all"];
    items.forEach(function (item) {
      if (item.category && categories.indexOf(item.category) === -1) categories.push(item.category);
    });
    if (categories.indexOf(inventoryFilter.category) === -1) inventoryFilter.category = "all";

    function choose(kind, value) {
      inventoryFilter[kind] = value;
      renderInventory();
    }

    var placement = el("label", { class: "filter-field" });
    placement.append(el("span", { text: "Status" }));
    var placementSelect = el("select");
    [
      { id: "all", label: "All" },
      { id: "warehouse", label: "In warehouse" },
      { id: "job", label: "On a job" }
    ].forEach(function (option) {
      var node = el("option", { value: option.id, text: option.label });
      if (option.id === inventoryFilter.placement) node.selected = true;
      placementSelect.append(node);
    });
    placementSelect.addEventListener("change", function () { choose("placement", placementSelect.value); });
    placement.append(placementSelect);

    var category = el("label", { class: "filter-field" });
    category.append(el("span", { text: "Category" }));
    var categorySelect = el("select");
    categories.forEach(function (name) {
      var node = el("option", { value: name, text: name === "all" ? "All" : name });
      if (name === inventoryFilter.category) node.selected = true;
      categorySelect.append(node);
    });
    categorySelect.addEventListener("change", function () { choose("category", categorySelect.value); });
    category.append(categorySelect);

    var shown = items.filter(function (item) {
      if (inventoryFilter.placement !== "all" && item.placement !== inventoryFilter.placement) return false;
      if (inventoryFilter.category !== "all" && item.category !== inventoryFilter.category) return false;
      return true;
    });

    var grid = el("div", { class: "inventory-grid" });
    if (!shown.length) grid.append(el("p", { class: "muted", text: "Nothing in the sample matches that filter." }));
    shown.forEach(function (item) {
      var card = el("article", { class: "card inventory-card" });
      if (item.photo) card.append(el("img", { class: "thumb", src: item.photo, alt: item.photoAlt || item.name || "" }));
      var body = el("div");
      body.append(el("p", { class: "fine", text: item.category || "" }));
      body.append(el("h2", { text: item.name }));
      body.append(el("p", { text: inventoryWhere(item) }));
      card.append(body);
      grid.append(card);
    });

    var free = items.filter(function (item) { return item.placement === "warehouse"; }).length;
    mount([
      head("Furniture inventory", "Sample pieces and sets. Photos are portfolio stand-ins, not a catalog shoot."),
      el("div", { class: "toolbar", children: [
        el("div", { class: "filters", children: [placement, category] }),
        el("p", { class: "fine", text: free + " in the warehouse · " + (items.length - free) + " out on a job" })
      ]}),
      grid
    ]);
  }

  function goneQuiet(member) {
    var days = daysSince(member.lastActivity);
    return days != null && days >= 60;
  }

  function renderMembers() {
    pageTitle("VIP members");
    var members = ((sample && sample.members) || []).slice().sort(function (a, b) {
      var quiet = Number(goneQuiet(b)) - Number(goneQuiet(a));
      if (quiet) return quiet;
      return String(a.lastActivity || "").localeCompare(String(b.lastActivity || ""));
    });
    var quietCount = members.filter(goneQuiet).length;
    var list = el("div", { class: "stack-list" });
    members.forEach(function (member) {
      var card = el("article", { class: "card member-card" });
      var top = el("div", { class: "member-top" });
      top.append(el("h2", { text: member.name }));
      if (goneQuiet(member)) top.append(el("span", { class: "flag", text: "Gone quiet" }));
      card.append(top);
      card.append(el("p", { class: "fine", text: member.brokerage || "" }));
      var joined = member.joined && parseIso(member.joined) ? formatMonthDayYear(parseIso(member.joined)) : "";
      var last = member.lastActivity && parseIso(member.lastActivity) ? formatMonthDayYear(parseIso(member.lastActivity)) : "";
      card.append(el("p", { text: "Joined " + joined }));
      card.append(el("p", { text: (member.jobsSent || 0) + (member.jobsSent === 1 ? " job sent" : " jobs sent") }));
      card.append(el("p", { text: "Last activity " + last }));
      list.append(card);
    });
    mount([
      head("VIP members", "Sample agents in the VIP program. Gone quiet means no activity in 60 or more days."),
      el("p", { class: "fine", text: quietCount + " gone quiet in this sample." }),
      list
    ]);
  }

  function quotePerson(quote) {
    var client = quote.clientId ? clientById(quote.clientId) : null;
    return (client && client.name) || quote.name || "Sample contact";
  }

  function needsNudge(quote) {
    if (quote.status !== "sent") return false;
    var days = daysSince(quote.sentOn);
    return days != null && days >= 7;
  }

  function renderQuotes() {
    pageTitle("Quotes");
    var quotes = ((sample && sample.quotes) || []).slice().sort(function (a, b) {
      function rank(quote) {
        if (needsNudge(quote)) return 0;
        if (quote.status === "sent") return 1;
        if (quote.status === "accepted") return 2;
        return 3;
      }
      var diff = rank(a) - rank(b);
      if (diff) return diff;
      return String(b.sentOn || "").localeCompare(String(a.sentOn || ""));
    });
    var counts = { sent: 0, accepted: 0, declined: 0 };
    quotes.forEach(function (quote) {
      if (counts[quote.status] != null) counts[quote.status] += 1;
    });
    var list = el("div", { class: "stack-list" });
    quotes.forEach(function (quote) {
      var card = el("article", { class: "card" });
      var top = el("div", { class: "member-top" });
      top.append(el("h2", { text: quotePerson(quote) }));
      top.append(el("span", { class: "badge", text: quoteStatusLabel(quote.status) }));
      if (needsNudge(quote)) top.append(el("span", { class: "flag", text: "Needs a nudge" }));
      card.append(top);
      card.append(el("p", { text: quote.address || "" }));
      var sent = quote.sentOn && parseIso(quote.sentOn) ? formatMonthDayYear(parseIso(quote.sentOn)) : "";
      card.append(el("p", { class: "price", text: money(quote.amount) }));
      card.append(el("p", { class: "fine", text: [quote.service, sent ? "Sent " + sent : ""].filter(Boolean).join(" · ") }));
      list.append(card);
    });
    mount([
      head("Quote pipeline", "Sample quotes. Needs a nudge means sent, with no answer for about 7 days."),
      el("p", { class: "counts", children: [
        el("span", { text: counts.sent + " sent" }),
        el("span", { text: counts.accepted + " accepted" }),
        el("span", { text: counts.declined + " declined" })
      ]}),
      list
    ]);
  }

  function renderMarketing() {
    pageTitle("Marketing");
    var items = (sample && sample.marketing) || [];
    var list = el("div", { class: "stack-list" });
    items.forEach(function (item) {
      var card = el("article", { class: "card" });
      var top = el("div", { class: "member-top" });
      top.append(el("h2", { text: item.title }));
      top.append(el("span", { class: "badge", text: marketingStatusLabel(item.status) }));
      card.append(top);
      if (item.place) card.append(el("p", { class: "fine", text: item.place }));
      var pair = el("div", { class: "pair" });
      var before = el("figure", { class: "shot" });
      before.append(
        el("img", { src: item.before || "", alt: item.beforeAlt || "Before" }),
        el("figcaption", { text: "Before" })
      );
      var after = el("figure", { class: "shot" });
      after.append(
        el("img", { src: item.after || "", alt: item.afterAlt || "After" }),
        el("figcaption", { text: "After" })
      );
      pair.append(before, after);
      card.append(pair);
      if (item.caption) card.append(el("p", { text: item.caption }));
      list.append(card);
    });
    mount([
      head("Marketing queue", "Finished sample projects with before and after pairs, ready for a Facebook or Google Business post. This page does not post anything."),
      el("p", { class: "fine", text: "Status is Ready, Drafted, or Posted. Photos are reused from the public portfolio." }),
      list
    ]);
  }

  function initLogin() {
    var form = document.getElementById("login-form");
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var emailField = document.getElementById("email");
        var email = emailField ? emailField.value.trim() : "";
        rememberUser(email || "Demo user");
        window.location.href = "dashboard.html";
      });
    }
    var demo = document.getElementById("view-demo");
    if (demo) {
      demo.addEventListener("click", function () {
        rememberUser("Demo user");
      });
    }
  }

  function init() {
    paintStatic();
    paintChrome();
    initNav();
    if (!sample && page !== "login") {
      missingData();
      return;
    }
    if (page === "login") {
      pageTitle("Sign in");
      initLogin();
    } else if (page === "dashboard") renderDashboard();
    else if (page === "clients") renderClients();
    else if (page === "client") renderClient();
    else if (page === "calendar") renderCalendar();
    else if (page === "projects") renderProjects();
    else if (page === "leads") renderLeads();
    else if (page === "rescue") renderRescue();
    else if (page === "opens") renderOpenHouses();
    else if (page === "virtual") renderVirtual();
    else if (page === "inventory") renderInventory();
    else if (page === "members") renderMembers();
    else if (page === "quotes") renderQuotes();
    else if (page === "marketing") renderMarketing();
  }

  init();
})();

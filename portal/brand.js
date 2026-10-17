/* Brand theme for the client portal.
   Swap this file to restyle or rebrand. portal.js and portal.css
   do not name the business, set its colors, or store contact details. */
(function () {
  var brand = {
    businessName: "Staged4Sale",
    tagline: "Home staging · North County San Diego",
    logoSrc: "../images/logo2.png",
    logoAlt: "Staged4Sale",
    favicon: "../favicon.ico",
    publicSiteHref: "../",
    colorScheme: "dark",
    fonts: {
      href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Lato:wght@300;400;600;700&display=swap",
      display: '"Playfair Display", Georgia, "Times New Roman", serif',
      body: '"Lato", "Helvetica Neue", Arial, sans-serif'
    },
    colors: {
      bg: "#1a1a1a",
      surface: "#222222",
      surfaceRaised: "#2a2a2a",
      header: "#000000",
      text: "#e0e0e0",
      muted: "#b0b0b0",
      accent: "#ffd700",
      accentHover: "#e6c200",
      accentInk: "#1a1a1a",
      line: "rgba(255, 215, 0, 0.35)",
      track: "#3a3a3a",
      paper: "#f6f1e3",
      paperInk: "#1a1a1a"
    },
    contact: {
      advisorName: "Tawni",
      phoneDisplay: "(760) 583-2500",
      phoneTel: "+17605832500",
      email: "sales@staged4sale.com"
    },
    messageSubject: "Question about my staging project"
  };

  window.PortalBrand = brand;

  var root = document.documentElement;
  var colors = brand.colors;
  var vars = {
    "--p-bg": colors.bg,
    "--p-surface": colors.surface,
    "--p-surface-raised": colors.surfaceRaised,
    "--p-header": colors.header,
    "--p-text": colors.text,
    "--p-muted": colors.muted,
    "--p-accent": colors.accent,
    "--p-accent-hover": colors.accentHover,
    "--p-accent-ink": colors.accentInk,
    "--p-line": colors.line,
    "--p-track": colors.track,
    "--p-paper": colors.paper,
    "--p-paper-ink": colors.paperInk,
    "--p-font-display": brand.fonts.display,
    "--p-font-body": brand.fonts.body
  };

  Object.keys(vars).forEach(function (name) {
    root.style.setProperty(name, vars[name]);
  });

  if (brand.colorScheme) {
    root.style.colorScheme = brand.colorScheme;
  }

  function addLink(rel, href, attrs) {
    var node = document.createElement("link");
    node.rel = rel;
    node.href = href;
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        node.setAttribute(key, attrs[key]);
      });
    }
    document.head.appendChild(node);
  }

  addLink("preconnect", "https://fonts.googleapis.com");
  addLink("preconnect", "https://fonts.gstatic.com", { crossorigin: "anonymous" });
  addLink("stylesheet", brand.fonts.href);
  addLink("icon", brand.favicon);

  var theme = document.createElement("meta");
  theme.name = "theme-color";
  theme.content = colors.header;
  document.head.appendChild(theme);
})();

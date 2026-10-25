/* Brand theme for the sample admin.
   Swap this file to restyle or rebrand. admin.js and admin.css
   do not name the business, set its colors, or store contact details. */
(function () {
  var brand = {
    businessName: "Staged4Sale",
    productName: "Admin",
    greetingName: "Tawni",
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
      line: "rgba(255, 215, 0, 0.35)"
    },
    contact: {
      phoneDisplay: "(760) 583-2500",
      phoneTel: "+17605832500",
      email: "sales@staged4sale.com"
    },
    leadsNote: "In real use, Tawni manages leads by chatting with the Staged4Sale assistant in the #grokbot Slack channel (or directly), and the CRM records live in Notion. This screen is just a quick view, not a sales pipeline."
  };

  window.AdminBrand = brand;

  var root = document.documentElement;
  var colors = brand.colors;
  var vars = {
    "--a-bg": colors.bg,
    "--a-surface": colors.surface,
    "--a-surface-raised": colors.surfaceRaised,
    "--a-header": colors.header,
    "--a-text": colors.text,
    "--a-muted": colors.muted,
    "--a-accent": colors.accent,
    "--a-accent-hover": colors.accentHover,
    "--a-accent-ink": colors.accentInk,
    "--a-line": colors.line,
    "--a-font-display": brand.fonts.display,
    "--a-font-body": brand.fonts.body
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

/* Read-only quote. The quote is in the URL fragment. Nothing is stored. */
(function () {
  var engine = window.QuoteEngine;
  var main = document.getElementById("main");
  var button = document.getElementById("download-pdf");

  function showEmpty(title, message) {
    document.title = "Staging quote · Staged4Sale";
    if (!main) return;
    main.replaceChildren();
    var box = document.createElement("div");
    box.className = "view-empty";
    var heading = document.createElement("h1");
    heading.textContent = title;
    var copy = document.createElement("p");
    copy.textContent = message;
    box.append(heading, copy);
    main.appendChild(box);
  }

  function showQuote(model) {
    document.title = "Staging Quote " + (model.number || "") + " · " + (model.business || "Staged4Sale");
    if (!main) return;
    main.replaceChildren(engine.renderPaper(model, {
      logo: "../images/logo2.png",
      heading: "h1"
    }));
  }

  function openFromHash() {
    var hash = location.hash || "";
    if (!hash || hash === "#") {
      showEmpty("No quote in this link", "This page opens a quote when the link includes one. Ask Staged4Sale to send the quote again.");
      return;
    }
    engine.decodeHash(hash).then(function (model) {
      if (!model) {
        showEmpty("This link could not be read", "Ask Staged4Sale for a new quote link.");
        return;
      }
      showQuote(model);
    }).catch(function () {
      showEmpty("This link could not be read", "Ask Staged4Sale for a new quote link.");
    });
  }

  if (button) {
    button.addEventListener("click", function () {
      if (!document.getElementById("quote-paper")) return;
      window.print();
    });
  }

  window.addEventListener("hashchange", openFromHash);
  openFromHash();
})();

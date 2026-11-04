/* Renders the page from window.SITE_CONTENT (js/content.js) and wires up
   the menu, theme toggle and current-section highlighting.
   You should not need to edit this file to change your personal details. */
(function () {
  "use strict";

  var content = window.SITE_CONTENT;
  if (!content) {
    console.warn("SITE_CONTENT is missing. Check that js/content.js loads before js/main.js.");
    return;
  }

  /* ---------- Small helpers ---------- */

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function srOnly(text) {
    return el("span", "visually-hidden", text);
  }

  function externalLink(href, label, extraHidden) {
    var a = el("a", "text-link");
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.appendChild(document.createTextNode(label));
    if (extraHidden) a.appendChild(srOnly(extraHidden));
    a.appendChild(srOnly(" (opens in a new tab)"));
    return a;
  }

  function fill(selector, build) {
    var target = document.querySelector('[data-render="' + selector + '"]');
    if (!target) return;
    target.textContent = "";
    build(target);
  }

  /* ---------- Render content ---------- */

  function renderContent() {
    document.title = content.role ? content.name + " — " + content.role : content.name;
    var meta = document.querySelector('meta[name="description"]');
    var description = content.description ||
      ("Portfolio of " + content.name + (content.role ? ", " + content.role : "") + ". " + (content.pitch || "")).trim();
    if (meta) meta.setAttribute("content", description);
    setFavicon(content.name);

    var simple = { name: content.name, role: content.role, pitch: content.pitch };
    document.querySelectorAll("[data-content]").forEach(function (node) {
      var key = node.getAttribute("data-content");
      if (simple[key] != null) node.textContent = simple[key];
    });

    fill("about", function (target) {
      (content.about || []).forEach(function (paragraph) {
        target.appendChild(el("p", null, paragraph));
      });
    });

    var avatar = document.querySelector('[data-render="avatar"]');
    if (avatar && content.avatar) {
      avatar.src = content.avatar.src;
      avatar.alt = content.avatar.alt || "Portrait of " + content.name;
    }

    fill("skills", function (target) {
      (content.skills || []).forEach(function (group) {
        var card = el("div", "skill-group");
        card.appendChild(el("h3", "skill-group-title", group.group));
        var list = el("ul", "tag-list");
        list.setAttribute("aria-label", group.group + " skills");
        group.items.forEach(function (item) {
          list.appendChild(el("li", "tag", item));
        });
        card.appendChild(list);
        target.appendChild(card);
      });
    });

    fill("projects", function (target) {
      (content.projects || []).forEach(function (project) {
        var card = el("li", "project-card");

        if (project.image && project.image.src) {
          var img = el("img", "project-image");
          img.src = project.image.src;
          img.alt = project.image.alt || "Preview of " + project.title;
          img.width = 640;
          img.height = 360;
          img.loading = "lazy";
          card.appendChild(img);
        }

        var body = el("div", "project-body");
        body.appendChild(el("h3", "project-title", project.title));
        body.appendChild(el("p", "project-desc", project.description));

        var tags = el("ul", "tag-list");
        tags.setAttribute("aria-label", "Built with");
        (project.tags || []).forEach(function (tag) {
          tags.appendChild(el("li", "tag tag-small", tag));
        });
        body.appendChild(tags);

        var links = el("p", "project-links");
        if (project.liveUrl) links.appendChild(externalLink(project.liveUrl, "Live", ": " + project.title));
        if (project.codeUrl) links.appendChild(externalLink(project.codeUrl, "Code", ": " + project.title));
        if (links.childNodes.length) body.appendChild(links);

        card.appendChild(body);
        target.appendChild(card);
      });
    });

    var contact = content.contact || {};
    fill("contact-blurb", function (target) {
      target.textContent = contact.blurb || "";
    });

    fill("contact-links", function (target) {
      function item(label, link) {
        var li = el("li");
        li.appendChild(el("span", "contact-label", label));
        link.classList.add("contact-value");
        li.appendChild(link);
        target.appendChild(li);
      }
      if (contact.email) {
        var mail = el("a", "text-link", contact.email);
        mail.href = "mailto:" + contact.email;
        item("Email", mail);
      }
      if (contact.github) item("GitHub", externalLink(contact.github, prettyUrl(contact.github)));
      if (contact.linkedin) item("LinkedIn", externalLink(contact.linkedin, prettyUrl(contact.linkedin)));
    });

    var year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  // Builds a favicon showing the first letter of your name.
  function setFavicon(name) {
    var link = document.querySelector('link[rel="icon"]');
    var letter = (name || "").trim().charAt(0).toUpperCase();
    if (!link || !letter) return;
    var safe = letter.replace(/[<>&"']/g, "");
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
      '<rect width="64" height="64" rx="14" fill="#0b6b62"/>' +
      '<text x="32" y="44" text-anchor="middle" font-family="Georgia, serif" font-size="34" font-weight="700" fill="#ffffff">' +
      safe + "</text></svg>";
    link.href = "data:image/svg+xml," + encodeURIComponent(svg);
  }

  function prettyUrl(url) {
    return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  }

  /* ---------- Mobile menu ---------- */

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.getElementById("primary-nav");
    if (!button || !nav) return;

    function setOpen(open) {
      button.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("menu-open", open);
    }

    button.addEventListener("click", function () {
      setOpen(button.getAttribute("aria-expanded") !== "true");
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && button.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        button.focus();
      }
    });

    // Close the menu if the window grows past the mobile breakpoint.
    var desktop = window.matchMedia("(min-width: 48rem)");
    var onChange = function (e) { if (e.matches) setOpen(false); };
    if (desktop.addEventListener) desktop.addEventListener("change", onChange);
    else if (desktop.addListener) desktop.addListener(onChange);
  }

  /* ---------- Theme toggle (optional manual override) ---------- */

  function setupTheme() {
    var button = document.querySelector(".theme-toggle");
    if (!button) return;
    var root = document.documentElement;
    var systemDark = window.matchMedia("(prefers-color-scheme: dark)");

    function current() {
      return root.getAttribute("data-theme") || (systemDark.matches ? "dark" : "light");
    }

    function updateLabel() {
      var next = current() === "dark" ? "light" : "dark";
      button.setAttribute("aria-label", "Switch to " + next + " theme");
    }

    button.addEventListener("click", function () {
      var next = current() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) { /* ignore */ }
      updateLabel();
    });

    var onSystemChange = function () { updateLabel(); };
    if (systemDark.addEventListener) systemDark.addEventListener("change", onSystemChange);
    else if (systemDark.addListener) systemDark.addListener(onSystemChange);
    updateLabel();
  }

  /* ---------- Highlight the section in view ---------- */

  function setupActiveSection() {
    if (!("IntersectionObserver" in window)) return;
    var links = Array.prototype.slice.call(document.querySelectorAll(".nav-list a[href^='#']"));
    var byId = {};
    links.forEach(function (link) { byId[link.getAttribute("href").slice(1)] = link; });

    function activate(id) {
      links.forEach(function (link) {
        if (link === byId[id]) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) activate(entry.target.id);
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    document.querySelectorAll("main section[id]").forEach(function (section) {
      observer.observe(section);
    });
  }

  renderContent();
  setupMenu();
  setupTheme();
  setupActiveSection();
})();

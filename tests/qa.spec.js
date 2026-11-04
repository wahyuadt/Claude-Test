// Automated QA suite for the portfolio site.
// Run from the repo root:   node tests/qa.spec.js
// Against the live site:    BASE_URL=https://wahyuadt.github.io/Claude-Test/ node tests/qa.spec.js
//
// Uses Node's built-in test runner (node:test) and the `playwright` library.

const { test, before, after, describe } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const vm = require("node:vm");
const { chromium } = require("playwright");
const { REPO_NAME, start } = require("./serve");

const ROOT = path.resolve(__dirname, "..");
const LIVE = Boolean(process.env.BASE_URL);
const SITE_PATH = "/" + REPO_NAME + "/"; // the exact, case-sensitive site root path

let browser, server, BASE;

// Reads window.SITE_CONTENT from a content.js file without a browser.
function readContent(file) {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(file, "utf8"), sandbox);
  return sandbox.window.SITE_CONTENT;
}
const CONTENT = readContent(path.join(ROOT, "js/content.js"));

// Opens a page and records console errors, page errors and failed requests.
async function open(url, options = {}) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, ...options });
  const page = await context.newPage();
  const problems = [];
  page.on("console", (m) => { if (m.type() === "error") problems.push("console: " + m.text()); });
  page.on("pageerror", (e) => problems.push("page error: " + e.message));
  page.on("requestfailed", (r) => problems.push("request failed: " + r.url()));
  page.on("response", (r) => { if (r.status() >= 400) problems.push(r.status() + " " + r.url()); });
  const response = await page.goto(url, { waitUntil: "load" });
  return { page, context, problems, response };
}

before(async () => {
  browser = await chromium.launch();
  if (LIVE) {
    BASE = process.env.BASE_URL.replace(/\/?$/, "/");
  } else {
    server = await start();
    BASE = server.url;
  }
  console.log("# Testing " + BASE);
});

after(async () => {
  if (browser) await browser.close();
  if (server) await server.close();
});

describe("files", { skip: LIVE && "checks the local repo only" }, () => {
  test("required files exist", () => {
    for (const f of ["index.html", "404.html", "css/styles.css", "js/main.js", "js/content.js", "README.md", ".nojekyll", "assets"]) {
      assert.ok(fs.existsSync(path.join(ROOT, f)), "missing: " + f);
    }
  });

  test("assets/ holds only local SVG files", () => {
    for (const f of fs.readdirSync(path.join(ROOT, "assets"))) assert.match(f, /\.svg$/, "unexpected asset: " + f);
  });
});

describe("home page", () => {
  test("renders every section, the nav and the content from content.js", async () => {
    const { page, context } = await open(BASE);
    for (const id of ["top", "about", "skills", "projects", "contact"]) {
      assert.ok(await page.locator("section#" + id).isVisible(), "section #" + id + " not visible");
    }
    for (const id of ["about", "skills", "projects", "contact"]) {
      assert.equal(await page.locator(`.nav-list a[href="#${id}"]`).count(), 1, "nav link to #" + id + " missing");
    }
    assert.equal(await page.title(), `${CONTENT.name} — ${CONTENT.role}`);
    assert.match(await page.locator("h1").innerText(), new RegExp(CONTENT.name));
    assert.equal(await page.locator(".project-card").count(), CONTENT.projects.length);
    assert.equal(await page.locator(".project-card a", { hasText: "Live" }).count(), CONTENT.projects.filter((p) => p.liveUrl).length);
    assert.equal(await page.locator(".project-card a", { hasText: "Code" }).count(), CONTENT.projects.filter((p) => p.codeUrl).length);
    assert.equal(await page.locator(`a[href="mailto:${CONTENT.contact.email}"]`).count(), 1);
    assert.equal(await page.locator("#year").innerText(), String(new Date().getFullYear()));
    assert.ok(await page.getByRole("link", { name: "View projects" }).isVisible());
    assert.ok(await page.getByRole("link", { name: "Contact me" }).isVisible());
    await context.close();
  });

  test("no console errors or failed requests, in light and dark, at 375px and 1280px", async () => {
    for (const width of [375, 1280]) for (const colorScheme of ["light", "dark"]) {
      const { page, context, problems } = await open(BASE, { viewport: { width, height: 800 }, colorScheme });
      // Scroll through so lazy-loaded images are requested too.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); }
      });
      await page.waitForLoadState("networkidle");
      const broken = await page.evaluate(() => [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.src));
      assert.deepEqual(problems, [], `${width}px ${colorScheme}`);
      assert.deepEqual(broken, [], `broken images at ${width}px ${colorScheme}`);
      await context.close();
    }
  });

  test("dark colour scheme changes the page background", async () => {
    const bg = async (colorScheme) => {
      const { page, context } = await open(BASE, { colorScheme });
      const value = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      await context.close();
      return value;
    };
    assert.notEqual(await bg("light"), await bg("dark"));
  });

  test("no horizontal scroll at 375px", async () => {
    const { page, context } = await open(BASE, { viewport: { width: 375, height: 800 } });
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth,
    }));
    assert.ok(scrollWidth <= clientWidth, `page is ${scrollWidth}px wide in a ${clientWidth}px window`);
    await context.close();
  });

  test("exactly one h1, logical heading order, and alt text on every image", async () => {
    const { page, context } = await open(BASE);
    assert.equal(await page.locator("h1").count(), 1);
    const levels = await page.evaluate(() => [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => Number(h.tagName[1])));
    levels.forEach((level, i) => { if (i > 0) assert.ok(level <= levels[i - 1] + 1, "heading level skipped at heading #" + (i + 1)); });
    const missingAlt = await page.evaluate(() => [...document.images].filter((i) => !i.getAttribute("alt")).map((i) => i.src));
    assert.deepEqual(missingAlt, []);
    for (const landmark of ["header", "nav", "main", "footer"]) assert.equal(await page.locator(landmark).count() >= 1, true, landmark);
    await context.close();
  });

  test("skip link is the first Tab stop, is visible and moves focus to main", async () => {
    const { page, context } = await open(BASE);
    await page.keyboard.press("Tab");
    const skip = page.locator(".skip-link");
    assert.equal(await skip.evaluate((el) => el === document.activeElement), true);
    const box = await skip.boundingBox();
    assert.ok(box && box.y >= 0, "skip link is off screen when focused");
    await page.keyboard.press("Enter");
    assert.equal(await page.evaluate(() => document.activeElement.id), "main");
    await context.close();
  });

  test("keyboard focus is visible on links and buttons", async () => {
    const { page, context } = await open(BASE, { viewport: { width: 375, height: 800 } });
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press("Tab");
      const outline = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle);
      assert.notEqual(outline, "none", "no focus outline on Tab stop " + (i + 1));
    }
    await context.close();
  });

  test("mobile menu: aria-expanded toggles, Escape closes it, a link closes it", async () => {
    const { page, context } = await open(BASE, { viewport: { width: 375, height: 800 } });
    const button = page.locator(".menu-toggle");
    const list = page.locator(".nav-list");
    assert.equal(await button.getAttribute("aria-expanded"), "false");
    assert.equal(await list.isVisible(), false, "menu should start closed");
    await button.click();
    assert.equal(await button.getAttribute("aria-expanded"), "true");
    assert.equal(await list.isVisible(), true);
    await page.keyboard.press("Escape");
    assert.equal(await button.getAttribute("aria-expanded"), "false");
    assert.equal(await button.evaluate((el) => el === document.activeElement), true, "focus should return to the menu button");
    // Open it by keyboard and follow a link.
    await page.keyboard.press("Enter");
    assert.equal(await button.getAttribute("aria-expanded"), "true");
    await list.locator('a[href="#projects"]').click();
    assert.equal(await button.getAttribute("aria-expanded"), "false");
    assert.equal(new URL(page.url()).hash, "#projects");
    await context.close();
  });

  test("menu button is hidden and links are inline at 1280px", async () => {
    const { page, context } = await open(BASE);
    assert.equal(await page.locator(".menu-toggle").isVisible(), false);
    assert.equal(await page.locator('.nav-list a[href="#about"]').isVisible(), true);
    await context.close();
  });

  test("theme toggle switches the theme and remembers it after reload", async () => {
    const { page, context } = await open(BASE, { colorScheme: "light" });
    const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const before = await bg();
    await page.locator(".theme-toggle").click();
    const toggled = await bg();
    assert.notEqual(toggled, before);
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), "dark");
    await page.reload();
    assert.equal(await bg(), toggled, "theme not remembered after reload");
    await page.locator(".theme-toggle").click();
    await page.reload();
    assert.equal(await bg(), before);
    await context.close();
  });

  test("respects prefers-reduced-motion", async () => {
    const { page, context } = await open(BASE, { reducedMotion: "reduce" });
    const motion = await page.evaluate(() => ({
      scroll: getComputedStyle(document.documentElement).scrollBehavior,
      transition: getComputedStyle(document.querySelector(".button")).transitionDuration,
    }));
    assert.equal(motion.scroll, "auto");
    assert.equal(motion.transition, "0s");
    await context.close();
  });

  test("without JavaScript the visitor sees a notice near the top", async () => {
    const { page, context } = await open(BASE, { viewport: { width: 375, height: 800 }, javaScriptEnabled: false });
    const notice = page.locator(".noscript");
    assert.equal(await notice.isVisible(), true);
    const box = await notice.boundingBox();
    assert.ok(box.y < 800, "no-JS notice is below the first screen");
    await context.close();
  });

  test("has a title, meta description and favicon", async () => {
    const { page, context } = await open(BASE);
    assert.ok((await page.title()).length > 0);
    assert.ok((await page.locator('meta[name="description"]').getAttribute("content")).length > 0);
    assert.equal(await page.locator('link[rel="icon"]').count(), 1);
    await context.close();
  });
});

describe("GitHub Pages sub-path", () => {
  // Every link, script, stylesheet, image and request that stays on this site
  // must start with the site path in its EXACT casing (e.g. /Claude-Test/).
  async function offSitePaths(url) {
    const { page, context } = await open(url);
    const requested = [];
    page.on("request", (r) => requested.push(r.url()));
    await page.reload({ waitUntil: "networkidle" });
    const origin = new URL(url).origin;
    const referenced = await page.evaluate(() =>
      [...document.querySelectorAll("a[href], link[href], script[src], img[src], source[src]")]
        .map((el) => el.href || el.src).filter(Boolean));
    await context.close();
    return [...new Set([...referenced, ...requested])]
      .filter((u) => u.startsWith(origin + "/"))
      .filter((u) => !new URL(u).pathname.startsWith(SITE_PATH));
  }

  test(`every same-site link and asset on the home page uses ${SITE_PATH}`, async () => {
    assert.deepEqual(await offSitePaths(BASE), []);
  });

  test(`every same-site link and asset on the 404 page uses ${SITE_PATH}`, async () => {
    assert.deepEqual(await offSitePaths(BASE + "no/such/page"), []);
  });

  test("site root without the trailing slash still reaches the site", async () => {
    const { page, context, response } = await open(BASE.replace(/\/$/, ""));
    assert.equal(response.status(), 200);
    assert.equal(new URL(page.url()).pathname, SITE_PATH);
    await context.close();
  });

  for (const missing of ["nope", "no/such/page", "a/b/c/d/e.html", "projects/x/"]) {
    test(`404 page at /${missing}: styled, and "Back to home" lands on the site root`, async () => {
      const { page, context, response } = await open(BASE + missing);
      assert.equal(response.status(), 404);
      assert.match(await page.locator("h1").innerText(), /not found/i);
      const color = await page.locator("a", { hasText: "Back to home" }).evaluate((a) => getComputedStyle(a).backgroundColor);
      assert.notEqual(color, "rgba(0, 0, 0, 0)", "home link is unstyled");
      const [home] = await Promise.all([page.waitForNavigation(), page.locator("a", { hasText: "Back to home" }).click()]);
      assert.equal(new URL(page.url()).pathname, SITE_PATH, "home link went to " + page.url());
      assert.equal(home && home.status(), 200, "home page did not load (status " + (home && home.status()) + ")");
      assert.match(await page.locator("h1").innerText(), new RegExp(CONTENT.name));
      await context.close();
    });
  }
});

describe("edit one file", { skip: LIVE && "needs a local copy of the site" }, () => {
  test("changing only content.js updates the whole page", async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "portfolio-edit-"));
    try {
      for (const f of ["index.html", "404.html", ".nojekyll", "css", "js", "assets"]) {
        fs.cpSync(path.join(ROOT, f), path.join(tmp, f), { recursive: true });
      }
      const file = path.join(tmp, "js/content.js");
      const original = CONTENT;
      const newName = "Zara Quill";
      const newTitle = "Edited Project Zeta";
      let src = fs.readFileSync(file, "utf8");
      src = src.replace("name: " + JSON.stringify(original.name), "name: " + JSON.stringify(newName));
      src = src.replace("title: " + JSON.stringify(original.projects[0].title), "title: " + JSON.stringify(newTitle));
      fs.writeFileSync(file, src);
      const edited = readContent(file);
      assert.equal(edited.name, newName, "test could not edit the name in content.js");
      assert.equal(edited.projects[0].title, newTitle, "test could not edit the project title in content.js");

      const copy = await start({ root: tmp });
      try {
        const { page, context, problems } = await open(copy.url);
        assert.equal(await page.title(), `${newName} — ${edited.role}`);
        assert.match(await page.locator("h1").innerText(), new RegExp(newName));
        assert.equal(await page.locator(".brand").innerText(), newName);
        assert.match(await page.locator(".site-footer").innerText(), new RegExp(newName));
        assert.equal(await page.locator(".project-title").first().innerText(), newTitle);
        assert.match(await page.locator('meta[name="description"]').getAttribute("content"), new RegExp(newName));
        const favicon = decodeURIComponent(await page.locator('link[rel="icon"]').getAttribute("href"));
        assert.match(favicon, new RegExp(">" + newName[0] + "<"), "favicon letter did not change");
        const text = await page.evaluate(() => document.body.innerText + " " + document.title +
          " " + [...document.images].map((i) => i.alt).join(" "));
        assert.ok(!text.includes(original.name), `old name "${original.name}" still on the page`);
        assert.deepEqual(problems, []);
        await context.close();
      } finally {
        await copy.close();
      }
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});

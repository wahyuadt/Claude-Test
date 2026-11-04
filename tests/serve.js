// A tiny static server that behaves like GitHub Pages for a *project* site.
// Node standard library only.
//
//   - The repo is served under /<REPO_NAME>/ (e.g. http://localhost:8080/Claude-Test/).
//   - Paths are matched case-sensitively, just like GitHub Pages.
//   - A missing path inside the site returns the repo's 404.html with status 404.
//   - A path outside the site (e.g. the wrong casing, /claude-test/) returns a
//     generic "Site not found" page with status 404, like github.io does.
//
// Run by hand:  node tests/serve.js        (then open the printed URL)

const REPO_NAME = "Claude-Test"; // <- must match the GitHub repository name EXACTLY (case matters)

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
};

const SITE_NOT_FOUND =
  "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><title>Site not found · GitHub Pages</title></head>" +
  "<body><h1>404</h1><p>There isn't a GitHub Pages site here.</p></body></html>";

// Case-sensitive existence check: every path segment must match a real
// directory entry exactly (protects against case-insensitive file systems).
function existsExact(root, rel) {
  let dir = root;
  for (const part of rel.split("/").filter(Boolean)) {
    let entries;
    try { entries = fs.readdirSync(dir); } catch { return false; }
    if (!entries.includes(part)) return false;
    dir = path.join(dir, part);
  }
  return true;
}

function send(res, status, type, body) {
  res.writeHead(status, { "Content-Type": type, "Content-Length": Buffer.byteLength(body), "Cache-Control": "no-store" });
  res.end(body);
}

function handler(root) {
  const prefix = "/" + REPO_NAME + "/";
  return (req, res) => {
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, "http://x").pathname); }
    catch { return send(res, 400, "text/plain", "Bad request"); }

    if (pathname === "/" + REPO_NAME) { res.writeHead(301, { Location: prefix }); return res.end(); }
    if (!pathname.startsWith(prefix)) return send(res, 404, TYPES[".html"], SITE_NOT_FOUND);

    const rel = pathname.slice(prefix.length);
    if (rel.split("/").some((p) => p === ".." || p.startsWith(".git"))) return send(res, 404, TYPES[".html"], SITE_NOT_FOUND);

    let file = path.join(root, rel);
    let ok = existsExact(root, rel);
    if (ok && fs.statSync(file).isDirectory()) {
      if (!pathname.endsWith("/")) { res.writeHead(301, { Location: pathname + "/" }); return res.end(); }
      file = path.join(file, "index.html");
      ok = fs.existsSync(file);
    }
    if (!ok) {
      const notFound = path.join(root, "404.html");
      if (fs.existsSync(notFound)) return send(res, 404, TYPES[".html"], fs.readFileSync(notFound));
      return send(res, 404, TYPES[".html"], SITE_NOT_FOUND);
    }
    const type = TYPES[path.extname(file).toLowerCase()] || "application/octet-stream";
    send(res, 200, type, fs.readFileSync(file));
  };
}

// Starts a server for `root` (default: the repo). Resolves to { url, close }.
function start({ root = path.resolve(__dirname, ".."), port = 0 } = {}) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(handler(root));
    server.on("error", reject);
    server.listen(port, "127.0.0.1", () => {
      const url = `http://127.0.0.1:${server.address().port}/${REPO_NAME}/`;
      resolve({ url, close: () => new Promise((r) => server.close(r)) });
    });
  });
}

module.exports = { REPO_NAME, start };

if (require.main === module) {
  start({ port: Number(process.env.PORT) || 8080 }).then(({ url }) => console.log("Serving the site at " + url));
}

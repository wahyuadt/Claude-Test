# My portfolio

A simple one-page portfolio website made with plain HTML, CSS and JavaScript.
There is nothing to install and no build step.

## 1. View it on your computer

You need Python 3 (already installed on most Macs and Linux machines).

1. Open a terminal in this folder.
2. Run:

   ```
   python3 -m http.server 8000
   ```

3. Open <http://localhost:8000> in your browser.
4. Press `Ctrl + C` in the terminal to stop the server when you're done.

## 2. Put in your own details

**Almost everything you need to change is in one file: `js/content.js`.**

Open it in any text editor. It contains your name, job title, short pitch, bio,
skills, projects and contact links. Replace each value marked `PLACEHOLDER`,
keep the quotes and commas, save, and refresh the browser.

A few optional extras:

- **Photo:** put your picture in the `assets/` folder (for example `assets/me.jpg`)
  and update `avatar.src` and `avatar.alt` in `js/content.js`.
- **Project images:** replace `assets/project-1.svg` to `project-3.svg`, or point
  each project's `image.src` at your own file.
- **Search engines and link previews:** the page title and description are set
  from `js/content.js`, but also update the `<title>` and
  `<meta name="description">` near the top of `index.html` so search engines
  and social sites see your name too.
- **Favicon (browser tab icon):** edit `assets/favicon.svg` (change the letter `Y`).
- **Colours:** change `--accent` and friends at the top of `css/styles.css`.

## 3. Publish it free with GitHub Pages

1. Create a new repository on GitHub and push this folder to it
   (the `main` branch).
2. On GitHub, open the repository and go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Choose branch **main** and folder **/ (root)**, then click **Save**.
5. Wait a minute or two, then refresh the page. GitHub shows your site's address,
   for example `https://your-username.github.io/portfolio/`.

Tip: if you name the repository `your-username.github.io`, the site lives at
`https://your-username.github.io/` instead.

If your site address ends in a folder name (like `/portfolio/`), open `404.html`
and change the "Back to home" link from `href="/"` to `href="/portfolio/"`.

## What's in this folder

| File / folder     | What it is                                            |
| ----------------- | ----------------------------------------------------- |
| `index.html`      | The page structure                                    |
| `js/content.js`   | **Your personal content — edit this**                 |
| `js/main.js`      | Builds the page from your content, menu, theme toggle |
| `css/styles.css`  | All the styling, light and dark themes                |
| `assets/`         | Images (small SVG placeholders)                       |
| `404.html`        | The "page not found" page                             |
| `.nojekyll`       | Tells GitHub Pages to serve the files as they are     |

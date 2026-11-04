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

**Everything personal is in one file: `js/content.js`.**

Open it in any text editor. It contains your name, job title, short pitch, bio,
skills, projects and contact links. Replace each value marked `PLACEHOLDER`,
keep the quotes and commas, save, and refresh the browser.

You only type your name once: the browser tab title, the search description,
the image descriptions (alt text) and the favicon letter are all built from it.

Optional extras:

- **Photo:** put your picture in the `assets/` folder (for example `assets/me.jpg`)
  and change `avatar.src` in `js/content.js`.
- **Project images:** replace `assets/project-1.svg` to `project-3.svg`, or point
  each project's `image.src` at your own file.
- **Colours:** change `--accent` and friends at the top of `css/styles.css`.

## 3. Publish it free with GitHub Pages

1. Create a new repository on GitHub and push this folder to it
   (the `main` branch).
2. On GitHub, open the repository and go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Choose branch **main** and folder **/ (root)**, then click **Save**.
5. Wait a minute or two, then refresh the page. GitHub shows your site's address,
   for example `https://your-username.github.io/claude-test/`.

### One setting to check: the 404 page

GitHub shows `404.html` whenever someone visits a page that doesn't exist.
It needs to know which folder your site lives in, so its "Back to home" link works.
Open `404.html` and find this line near the top:

```
<base href="/claude-test/">
```

- Site at `https://your-username.github.io/claude-test/` (repository named
  `claude-test`): leave it as it is.
- Repository with a different name, for example `portfolio`: change it to
  `<base href="/portfolio/">`.
- Repository named `your-username.github.io` (site at the top level): change it
  to `<base href="/">`.

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

# Automated tests

These tests open the site in a real (headless) Chrome browser and check it the
same way a person would: every section shows, nothing is broken, the mobile
menu and theme toggle work, the 404 page links home, and so on.

You don't need any of this to view or publish the site. It runs automatically
on GitHub for every pull request (see `.github/workflows/qa.yml`).

## Run them on your computer

You need [Node.js](https://nodejs.org/) 20 or newer.

```
cd tests
npm install
npx playwright install chromium
npm test
```

The first two install commands are only needed once. Each test prints a ✔ (pass)
or ✖ (fail), with the reason for any failure at the end.

## What's in here

| File           | What it does                                                       |
| -------------- | ------------------------------------------------------------------ |
| `qa.spec.js`   | All the checks                                                     |
| `serve.js`     | A tiny server that copies how GitHub Pages serves the site         |
| `package.json` | Lists the one thing the tests need (Playwright)                    |

`serve.js` serves the site at `http://127.0.0.1:<port>/Claude-Test/`, exactly
like GitHub Pages does, including case-sensitive paths and the `404.html` page
for missing addresses. **If you rename the repository, change `REPO_NAME` at the
top of `serve.js` to the new name (same capital letters).**

To look at the site through it yourself: `npm run serve`, then open the address
it prints.

## Test the live site

```
BASE_URL=https://wahyuadt.github.io/Claude-Test/ npm test
```

Checks that need the files on disk (file list, the edit test) are skipped.

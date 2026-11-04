# Project: Personal portfolio (static website)

Plain HTML, CSS and JavaScript. No build step, no frameworks, no npm needed to view it.
Hosted on GitHub Pages from the `main` branch root.

## Team
- Principal developer (human): sets tasks, approves and merges every pull request.
- Fully (`.claude/agents/fully.md`): builds and fixes.
- Qana (`.claude/agents/qana.md`): tests Fully's work; nothing reaches the principal without a PASS.

## Commands
- View locally: `python3 -m http.server 8000` then open http://localhost:8000
- Tests: `node tests/qa.spec.js` (Playwright) when present

## Rules
- Never commit to main. One branch per task, named `agent/<task-name>`.
- Keep it dependency-free; Google Fonts is the only allowed external resource.
- Personal content (name, bio, projects, links) lives in clearly marked places so the owner can edit it.
- Never read or print `.env` files or anything in `secrets/`.
- If a task is unclear, or you are stuck after two tries, stop and ask.

## Definition of done
Meets the task's "done when" list, passes Qana's checks, works at 375px and 1280px wide,
no console errors, and the pull request explains what changed and how it was tested.

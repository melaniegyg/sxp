# SXP — Supplier Portal concept

A static, front-end prototype of a **GetYourGuide Supplier Portal** view. Same setup as
[`dbr-portal`](https://github.com/melaniegyg/dbr-portal): plain HTML/CSS/JS, GYG design tokens
and fonts, no build step.

## Running it

Serve the folder over HTTP and open `index.html`:

```bash
python3 -m http.server 8123
# then open http://localhost:8123/index.html
```

## Structure

| Path | Purpose |
|------|---------|
| `index.html` | Page markup: top nav, sidebar, tabs, content sections |
| `css/tokens.css` | GYG design tokens (colors, type, radii) + fonts |
| `css/styles.css` | Shell (nav, sidebar, page layout) + shared components |
| `js/interactions.js` | Tab switching and other UI interactions |
| `js/auth-gate.js` | Cosmetic password gate for the shared preview |
| `assets/` | Logo + GT Eesti Pro Display fonts |

## Preview password

The gate in `js/auth-gate.js` is a **deterrent, not security** — this is a public static site,
so the password and all page content are readable in the source. Change `PASSWORD` in that file
to set it.

## Notes

Icons are inlined from GetYourGuide's design system (`@getyourguide/compass`). **Internal use only.**

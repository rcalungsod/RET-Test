# Solar System (Three.js)

This is a small static website that renders a simple 3D solar system using Three.js. It's designed to be published on GitHub Pages.

Files created:
- `index.html` — main page
- `js/main.js` — three.js scene (ES module)
- `css/styles.css` — minimal styling

To preview locally, open `index.html` in a browser that supports ES modules (or run a simple static server):

```bash
# from this repo root
python3 -m http.server 8000
# then open http://localhost:8000
```

To publish on GitHub Pages:
1. Commit and push this repository to GitHub.
2. In the repository settings -> Pages, select the `main` (or `master`) branch and root `/` folder.
3. Save; the site will be available at `https://<your-username>.github.io/<repo>` shortly.

Notes:
- The site loads Three.js via CDN (jsDelivr). No build step required.
- You can replace the simple colored materials with texture images if you want higher realism.
# RET-Test
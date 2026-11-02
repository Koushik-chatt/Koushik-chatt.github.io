# Koushik Chatterjee Portfolio Website

Static multi-page research portfolio website designed for GitHub Pages.

## Project Structure

```text
/
  index.html
  about.html
  projects.html
  publications.html
  cv.html
  codes.html
  README.md
  _config.yml

/assets
  /css
    styles.css
  /js
    script.js
  /images

/data
  projects.json
  publications.json
```

## Local Preview

1. Open a terminal in the repository root.
2. Start a local static server:

```bash
python3 -m http.server 8000
```

3. Visit:

```text
http://localhost:8000
```

## Deploy with GitHub Pages

1. Push this repository to GitHub.
2. In GitHub, go to **Settings > Pages**.
3. Under **Build and deployment**, set:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` (or your default branch)
   - **Folder**: `/ (root)`
4. Save settings and wait for deployment.
5. Your site will be available at:

```text
https://<your-username>.github.io/<repository-name>/
```

## Customization Notes

- Update personal details and links in:
  - `index.html`
  - `about.html`
- Update publications and project entries in:
  - `data/publications.json`
  - `data/projects.json`
- Replace/add media assets in:
  - `assets/images/`

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript

All internal links and asset paths use relative paths so the site works correctly on GitHub Pages.

# Dra. Marcela Astudillo G. — website

A static, one-page Jekyll site for GitHub Pages. All editable content lives in
`_data/site.yml` and is editable in the browser through [Pages CMS](https://pagescms.org).

```
_config.yml          Site URL / baseurl (edit before publishing)
_data/site.yml       All page content (hero, specialties, bio, contact, hours…)
_includes/           Inline SVG icons
index.html           Page template (Liquid)
assets/css/style.css Styles (brand tokens at the top)
assets/js/main.js    Mobile menu, scroll reveal, active nav, floating WhatsApp button
assets/img/          Logo, favicon mark, portrait (CMS uploads land here)
.pages.yml           Pages CMS form definition
EDITAR.md            Editing guide for the doctor (Spanish)
```

## Publish on GitHub Pages

1. Create a new **public** repository on GitHub (e.g. `dra-marcela-astudillo`) and push these files:
   ```bash
   git init && git add . && git commit -m "Sitio web inicial"
   git branch -M main
   git remote add origin https://github.com/USUARIO/dra-marcela-astudillo.git
   git push -u origin main
   ```
2. In the repo: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)`. GitHub builds Jekyll automatically.
3. Edit `_config.yml` so links and the favicon resolve:
   - Project URL (`https://USUARIO.github.io/dra-marcela-astudillo/`):
     `url: "https://USUARIO.github.io"` and `baseurl: "/dra-marcela-astudillo"`.
   - Custom domain: `url: "https://dominio.com"` and `baseurl: ""`, then add the domain under
     **Settings → Pages → Custom domain** (GitHub creates the `CNAME` file) and tick **Enforce HTTPS**.
     At your registrar, point the apex domain to GitHub's A records
     (185.199.108.153, .109.153, .110.153, .111.153) and `www` as a CNAME to `USUARIO.github.io`.

## Let her edit it (Pages CMS)

1. She needs a GitHub account with write access to the repo
   (**Settings → Collaborators → Add people**), or keep the repo under her own account.
2. She signs in at <https://app.pagescms.org> with GitHub, picks the repo, and sees
   **Contenido del sitio** with Spanish form fields defined in `.pages.yml`.
3. Each save is a commit; GitHub Pages rebuilds in ~1 minute.

`EDITAR.md` is a short Spanish guide you can send her.

## Local preview (optional)

```bash
bundle install
bundle exec jekyll serve --baseurl ""
# http://localhost:4000
```

## Notes

- **Map**: the embed uses Google Maps' key-less `output=embed` URL built from
  `contact.maps_query`. Check the pin lands on the right building; if not, refine the query
  (e.g. add the building name) or replace the iframe `src` in `index.html` with the embed code
  from Google Maps → Share → Embed a map.
- **Hours**: `contact.hours` currently says appointments are by prior booking; replace with real hours when known.
- **Accessibility**: WCAG AA color pairs from the brand system, skip link, focus rings,
  keyboard-operable menu (Esc closes), and all motion is disabled under `prefers-reduced-motion`.
- **SEO**: meta description, Open Graph (portrait as share image), and `Physician` JSON-LD.

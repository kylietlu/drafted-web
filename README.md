# Drafted Hugo site

This workspace contains a Hugo conversion of the live `draftedbykylie.com` website for static deployment.

## Structure

- `config.toml`: site configuration, menus, and theme selection
- `content/`: page and blog content
- `themes/drafted/`: Hugo theme layouts, partials, CSS, and JS
- `static/images/`: downloaded local media assets

## Notes

- The original live forms depended on Umso's hosted backend and CAPTCHA flow. In this static version, the contact and newsletter forms use a mailto fallback handled in `themes/drafted/static/js/theme.js`.
- A lightweight local-storage cookie banner is included for the static build.
- `hugo` is not installed in this environment, so the site structure was prepared directly but not rendered locally here.

# sponsorskit

Generate one hosted sponsor SVG for project READMEs and a Nuxt sponsor page where each logo links to its sponsor.

```md
[![Sponsors](https://raw.githubusercontent.com/murongg/sponsorskit/main/public/sponsors.svg)](https://sponsorskit.vercel.app)
```

## Usage

Edit `sponsors.yml`, then run:

```bash
bun run generate
```

The generator writes:

- `public/sponsors.svg` for README embeds
- `public/sponsors.json` for the Nuxt page

Run the site locally:

```bash
bun run dev
```

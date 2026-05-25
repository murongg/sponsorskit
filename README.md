# sponsorskit

Generate one hosted sponsor SVG for project READMEs and a Nuxt sponsor page where each logo links to its sponsor.

```md
[![Sponsors](https://your-domain.example/sponsors.svg)](https://your-domain.example)
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

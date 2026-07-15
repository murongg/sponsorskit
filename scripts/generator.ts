import { readFile } from "node:fs/promises";
import { extname, isAbsolute, resolve } from "node:path";
import { parse } from "yaml";

export type Sponsor = {
  name: string;
  logo: string;
  url: string;
  tier?: string;
};

export type SponsorsLayout = {
  width?: number;
  columns?: number;
  logoWidth?: number;
  logoHeight?: number;
  gap?: number;
};

export type SponsorsConfig = {
  title: string;
  description?: string;
  contactEmail?: string;
  layout?: SponsorsLayout;
  sponsors: Sponsor[];
};

export type SponsorGroup = {
  tier: string;
  sponsors: Sponsor[];
};

export type SponsorPageData = {
  title: string;
  description?: string;
  contactEmail?: string;
  sponsors: Sponsor[];
  groups: SponsorGroup[];
};

type ResolvedLayout = Required<SponsorsLayout>;

const DEFAULT_LAYOUT: ResolvedLayout = {
  width: 960,
  columns: 4,
  logoWidth: 156,
  logoHeight: 72,
  gap: 24,
};

const MIME_TYPES: Record<string, string> = {
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

const REMOTE_LOGO_FETCH_ATTEMPTS = 3;
const REMOTE_LOGO_RETRY_DELAY_MS = 200;

export function renderSponsorsSvg(config: SponsorsConfig): string {
  const layout = resolveLayout(config.layout);
  const groups = buildSponsorPageData(config).groups;

  if (groups.length === 0) {
    return renderEmptySponsorsSvg(config, layout);
  }

  const topPadding = 18;
  const headingHeight = 20;
  const headingToGrid = 10;
  const groupGap = 16;
  const bottomPadding = 18;
  let cursor = topPadding;
  const clipNodes: string[] = [];
  const groupNodes: string[] = [];

  for (const [groupIndex, group] of groups.entries()) {
    const columns = Math.max(1, Math.min(layout.columns, group.sponsors.length));
    const rowCount = Math.max(1, Math.ceil(group.sponsors.length / columns));
    const availableAvatarSize =
      (layout.width - layout.gap * Math.max(0, columns - 1)) / columns;
    const avatarSize = Math.min(
      layout.logoWidth,
      layout.logoHeight,
      availableAvatarSize,
    );

    groupNodes.push(
      `<text x="${layout.width / 2}" y="${formatNumber(cursor + 15)}" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="18" font-weight="700" fill="#333">${escapeText(group.tier)}</text>`,
    );
    cursor += headingHeight + headingToGrid;

    for (const [sponsorIndex, sponsor] of group.sponsors.entries()) {
      const row = Math.floor(sponsorIndex / columns);
      const column = sponsorIndex % columns;
      const rowSponsorCount = Math.min(
        columns,
        group.sponsors.length - row * columns,
      );
      const rowWidth =
        rowSponsorCount * avatarSize +
        layout.gap * Math.max(0, rowSponsorCount - 1);
      // Size rows from visible avatars so layout.gap remains the actual edge gap.
      const rowX = (layout.width - rowWidth) / 2;
      const avatarX = rowX + column * (avatarSize + layout.gap);
      const y = cursor + row * (layout.logoHeight + layout.gap);
      const avatarRadius = avatarSize / 2;
      const avatarY = y + (layout.logoHeight - avatarSize) / 2;
      const avatarCenterX = avatarX + avatarRadius;
      const avatarCenterY = avatarY + avatarRadius;
      const clipId = `sponsor-avatar-${groupIndex}-${sponsorIndex}`;

      clipNodes.push(
        `<clipPath id="${clipId}"><circle cx="${formatNumber(avatarCenterX)}" cy="${formatNumber(avatarCenterY)}" r="${formatNumber(avatarRadius)}" /></clipPath>`,
      );

      groupNodes.push(
        [
          `<a href="${escapeAttribute(sponsor.url)}" target="_blank" rel="noopener noreferrer">`,
          `<image href="${escapeAttribute(sponsor.logo)}" x="${formatNumber(avatarX)}" y="${formatNumber(avatarY)}" width="${formatNumber(avatarSize)}" height="${formatNumber(avatarSize)}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${clipId})" />`,
          `<title>${escapeText(sponsor.name)}</title>`,
          `</a>`,
        ].join(""),
      );
    }

    cursor +=
      rowCount * layout.logoHeight + Math.max(0, rowCount - 1) * layout.gap;

    if (groupIndex < groups.length - 1) {
      cursor += groupGap;
    }
  }

  const height = cursor + bottomPadding;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${height}" viewBox="0 0 ${layout.width} ${height}" role="img" aria-labelledby="title desc">`,
    `<title id="title">${escapeText(config.title)}</title>`,
    `<desc id="desc">Sponsor logos</desc>`,
    `<defs>${clipNodes.join("")}</defs>`,
    groupNodes.join(""),
    `</svg>`,
  ].join("");
}

function renderEmptySponsorsSvg(
  config: SponsorsConfig,
  layout: ResolvedLayout,
): string {
  const height = 84;
  const centerX = layout.width / 2;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${height}" viewBox="0 0 ${layout.width} ${height}" role="img" aria-labelledby="title desc">`,
    `<title id="title">${escapeText(config.title)}</title>`,
    `<desc id="desc">Open sponsor slots</desc>`,
    `<text x="${formatNumber(centerX)}" y="35" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="22" font-weight="700" fill="#202725">Open for sponsors</text>`,
    `<text x="${formatNumber(centerX)}" y="59" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="14" fill="#66736f">Support open source work</text>`,
    `</svg>`,
  ].join("");
}

export function buildSponsorPageData(config: SponsorsConfig): SponsorPageData {
  const groups: SponsorGroup[] = [];
  const groupIndex = new Map<string, SponsorGroup>();

  for (const sponsor of config.sponsors) {
    const tier = sponsor.tier ?? "Sponsors";
    const existing = groupIndex.get(tier);

    if (existing) {
      existing.sponsors.push(sponsor);
      continue;
    }

    const group = { tier, sponsors: [sponsor] };
    groupIndex.set(tier, group);
    groups.push(group);
  }

  return {
    title: config.title,
    description: config.description,
    contactEmail: config.contactEmail,
    sponsors: config.sponsors,
    groups,
  };
}

export async function loadSponsorsConfig(path: string): Promise<SponsorsConfig> {
  const rawConfig = parse(await readFile(path, "utf8")) as SponsorsConfig;
  validateConfig(rawConfig);
  return rawConfig;
}

export async function inlineSponsorLogos(
  config: SponsorsConfig,
  baseDir: string,
): Promise<SponsorsConfig> {
  return {
    ...config,
    sponsors: await Promise.all(
      config.sponsors.map(async (sponsor) => ({
        ...sponsor,
        logo: await toDataUri(sponsor.logo, baseDir),
      })),
    ),
  };
}

function resolveLayout(layout: SponsorsLayout = {}): ResolvedLayout {
  return {
    ...DEFAULT_LAYOUT,
    ...layout,
    columns: Math.max(1, layout.columns ?? DEFAULT_LAYOUT.columns),
  };
}

async function toDataUri(logo: string, baseDir: string): Promise<string> {
  if (logo.startsWith("data:")) {
    return logo;
  }

  if (logo.startsWith("http://") || logo.startsWith("https://")) {
    const response = await fetchRemoteLogo(logo);

    if (!response.ok) {
      throw new Error(`Failed to fetch logo ${logo}: ${response.status}`);
    }

    const contentType =
      response.headers.get("content-type")?.split(";")[0] ??
      MIME_TYPES[extname(new URL(logo).pathname).toLowerCase()] ??
      "application/octet-stream";
    const bytes = Buffer.from(await response.arrayBuffer());
    return `data:${contentType};base64,${bytes.toString("base64")}`;
  }

  const filePath = isAbsolute(logo) ? logo : resolve(baseDir, logo);
  const extension = extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[extension] ?? "application/octet-stream";
  const bytes = await readFile(filePath);

  return `data:${contentType};base64,${bytes.toString("base64")}`;
}

async function fetchRemoteLogo(logo: string): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= REMOTE_LOGO_FETCH_ATTEMPTS; attempt += 1) {
    try {
      return await fetch(logo);
    } catch (error) {
      lastError = error;

      if (attempt < REMOTE_LOGO_FETCH_ATTEMPTS) {
        // GitHub avatar connections can reset transiently during concurrent generation.
        await new Promise((resolve) =>
          setTimeout(resolve, REMOTE_LOGO_RETRY_DELAY_MS * attempt),
        );
      }
    }
  }

  throw lastError;
}

function validateConfig(config: SponsorsConfig): void {
  if (!config || typeof config !== "object") {
    throw new Error("sponsors.yml must contain an object.");
  }

  if (!config.title) {
    throw new Error("sponsors.yml must include a title.");
  }

  if (!Array.isArray(config.sponsors)) {
    throw new Error("sponsors.yml must include a sponsors array.");
  }

  for (const sponsor of config.sponsors) {
    if (!sponsor.name || !sponsor.logo || !sponsor.url) {
      throw new Error("Each sponsor must include name, logo, and url.");
    }
  }
}

function escapeText(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttribute(value: string): string {
  return escapeText(value).replaceAll('"', "&quot;");
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

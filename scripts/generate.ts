import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import {
  buildSponsorPageData,
  inlineSponsorLogos,
  loadSponsorsConfig,
  renderSponsorsSvg,
} from "./generator";

const root = resolve(import.meta.dir, "..");
const configPath = resolve(root, "sponsors.yml");
const publicDir = resolve(root, "public");

const config = await loadSponsorsConfig(configPath);
const svgConfig = await inlineSponsorLogos(config, dirname(configPath));
const svg = renderSponsorsSvg(svgConfig);
const pageData = buildSponsorPageData(svgConfig);

await mkdir(publicDir, { recursive: true });
await writeFile(resolve(publicDir, "sponsors.svg"), svg);
await writeFile(
  resolve(publicDir, "sponsors.json"),
  `${JSON.stringify(pageData, null, 2)}\n`,
);

console.log("Generated public/sponsors.svg and public/sponsors.json");

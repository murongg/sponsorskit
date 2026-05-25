import { describe, expect, it } from "bun:test";
import {
  buildSponsorPageData,
  renderSponsorsSvg,
  type SponsorsConfig,
} from "../scripts/generator";

const config: SponsorsConfig = {
  title: "Project Sponsors",
  description: "Synthetic sponsors used by tests.",
  contactEmail: "sponsor@example.test",
  layout: {
    width: 720,
    columns: 2,
    logoWidth: 160,
    logoHeight: 72,
    gap: 24,
  },
  sponsors: [
    {
      name: "Example Labs",
      logo: "https://cdn.example.test/example-labs.svg",
      url: "https://example.test",
      tier: "Gold",
    },
    {
      name: "Mock Cloud",
      logo: "https://cdn.example.test/mock-cloud.svg",
      url: "https://mock-cloud.example.test",
      tier: "Silver",
    },
    {
      name: "Fixture AI",
      logo: "https://cdn.example.test/fixture-ai.svg",
      url: "https://fixture-ai.example.test",
      tier: "Gold",
    },
  ],
};

describe("renderSponsorsSvg", () => {
  it("renders grouped sponsor logos with tier headings and linked logo images", () => {
    const svg = renderSponsorsSvg(config);

    expect(svg).toStartWith("<svg ");
    expect(svg).toContain('width="720"');
    expect(svg).toContain("Gold");
    expect(svg).toContain("Silver");
    expect(svg).toContain("Example Labs");
    expect(svg).toContain("https://cdn.example.test/example-labs.svg");
    expect(svg).toContain("Mock Cloud");
    expect(svg).toContain("Fixture AI");
    expect(svg).not.toContain("Synthetic sponsors used by tests.");
  });

  it("keeps the SVG background transparent so it blends into README surfaces", () => {
    const svg = renderSponsorsSvg(config);

    expect(svg).not.toContain("<rect width=");
  });

  it("derives the height from grouped sponsor rows", () => {
    const svg = renderSponsorsSvg(config);

    expect(svg).toContain('height="256"');
    expect(svg).toContain('viewBox="0 0 720 256"');
  });
});

describe("buildSponsorPageData", () => {
  it("groups sponsors by tier while preserving the configured order", () => {
    const pageData = buildSponsorPageData(config);

    expect(pageData.groups).toEqual([
      {
        tier: "Gold",
        sponsors: [config.sponsors[0], config.sponsors[2]],
      },
      {
        tier: "Silver",
        sponsors: [config.sponsors[1]],
      },
    ]);
    expect(pageData.contactEmail).toBe("sponsor@example.test");
  });
});

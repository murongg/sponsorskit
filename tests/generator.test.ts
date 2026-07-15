import { describe, expect, it } from "bun:test";
import {
  buildSponsorPageData,
  inlineSponsorLogos,
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

  it("crops sponsor logos into circles without stretching them", () => {
    const svg = renderSponsorsSvg(config);

    expect(svg).toContain('<clipPath id="sponsor-avatar-0-0">');
    expect(svg).toContain("<circle ");
    expect(svg).toContain('r="36" />');
    expect(svg).toContain(
      'width="72" height="72" preserveAspectRatio="xMidYMid slice" clip-path="url(#sponsor-avatar-0-0)"',
    );
  });

  it("uses the configured gap between visible avatars and centers sparse rows", () => {
    const svg = renderSponsorsSvg({
      ...config,
      sponsors: config.sponsors.map((sponsor) => ({
        ...sponsor,
        tier: "Sponsors",
      })),
    });

    expect(svg).toContain('<circle cx="312" cy="84" r="36" />');
    expect(svg).toContain('<circle cx="408" cy="84" r="36" />');
    expect(svg).toContain('<circle cx="360" cy="180" r="36" />');
  });

  it("derives the height from grouped sponsor rows", () => {
    const svg = renderSponsorsSvg(config);

    expect(svg).toContain('height="256"');
    expect(svg).toContain('viewBox="0 0 720 256"');
  });

  it("renders a default image when there are no sponsors", () => {
    const svg = renderSponsorsSvg({
      ...config,
      sponsors: [],
    });

    expect(svg).toContain('height="84"');
    expect(svg).toContain('viewBox="0 0 720 84"');
    expect(svg).toContain("<desc id=\"desc\">Open sponsor slots</desc>");
    expect(svg).toContain("Open for sponsors");
    expect(svg).toContain("Support open source work");
    expect(svg).not.toContain("<rect ");
    expect(svg).not.toContain("<path ");
    expect(svg).not.toContain("<circle ");
    expect(svg).not.toContain("No sponsors yet");
    expect(svg).not.toContain("<a href=");
    expect(svg).not.toContain("<image ");
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

describe("inlineSponsorLogos", () => {
  it("retries a remote logo after a transient network failure", async () => {
    const originalFetch = globalThis.fetch;
    let attempts = 0;

    globalThis.fetch = (async () => {
      attempts += 1;

      if (attempts === 1) {
        throw new TypeError("synthetic connection reset");
      }

      return new Response("<svg/>", {
        headers: { "content-type": "image/svg+xml" },
      });
    }) as typeof fetch;

    try {
      const result = await inlineSponsorLogos(
        {
          ...config,
          sponsors: [config.sponsors[0]],
        },
        "/tmp/synthetic-project",
      );

      expect(attempts).toBe(2);
      expect(result.sponsors[0]?.logo).toBe(
        "data:image/svg+xml;base64,PHN2Zy8+",
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

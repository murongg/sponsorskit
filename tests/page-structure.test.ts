import { readFile } from "node:fs/promises";
import { describe, expect, it } from "bun:test";

describe("sponsor page structure", () => {
  it("keeps the public page focused on grouped sponsor logos", async () => {
    const app = await readFile(new URL("../app/app.vue", import.meta.url), "utf8");

    expect(app).not.toContain("README");
    expect(app).not.toContain("sponsorskit");
    expect(app).not.toContain("sponsorCount");
    expect(app).not.toContain('href="/sponsors.svg"');
    expect(app).not.toContain("sponsor.name }}</span>");
    expect(app).toContain("group.tier");
  });

  it("centers sponsor logos even when there is only one sponsor", async () => {
    const app = await readFile(new URL("../app/app.vue", import.meta.url), "utf8");

    expect(app).not.toContain("group.sponsors.length <= 3");
    expect(app).not.toContain("sm:grid-cols-3");
    expect(app).toContain("flex w-full flex-wrap justify-center");
  });

  it("uses a neutral focus treatment instead of a colored border", async () => {
    const app = await readFile(new URL("../app/app.vue", import.meta.url), "utf8");

    expect(app).not.toContain("focus:ring-[oklch(0.58_0.08_150)]");
    expect(app).not.toContain("focus:ring-2");
    expect(app).toContain("focus-visible:ring-[oklch(0.72_0.004_250)]");
  });

  it("shows a concise introduction above the sponsor heading", async () => {
    const app = await readFile(new URL("../app/app.vue", import.meta.url), "utf8");
    const introIndex = app.indexOf("{{ data.description }}");
    const headingIndex = app.indexOf("{{ group.tier }}");

    expect(app).toContain("data?.description");
    expect(app).toContain("{{ data.description }}");
    expect(introIndex).toBeGreaterThanOrEqual(0);
    expect(headingIndex).toBeGreaterThanOrEqual(0);
    expect(introIndex).toBeLessThan(headingIndex);
  });

  it("adds a sponsor contact line with more space before the heading than before logos", async () => {
    const app = await readFile(new URL("../app/app.vue", import.meta.url), "utf8");

    expect(app).toContain("data?.contactEmail");
    expect(app).toContain("mailto:${data.contactEmail}");
    expect(app).toContain("class=\"flex flex-col items-center gap-12 text-center\"");
    expect(app).toContain("class=\"flex flex-col items-center gap-8 sm:gap-10\"");
    expect(app).toContain("gap-x-20 gap-y-14");
  });

  it("shows a top-right GitHub profile link", async () => {
    const app = await readFile(new URL("../app/app.vue", import.meta.url), "utf8");

    expect(app).toContain('href="https://github.com/murongg"');
    expect(app).toContain('aria-label="GitHub profile"');
    expect(app).toContain("absolute right-0 top-0 h-24 w-24");
    expect(app).toContain("[clip-path:polygon(100%_0,0_0,100%_100%)]");
    expect(app).toContain("h-7 w-7");
    expect(app).toContain('viewBox="0 0 24 24"');
  });
});

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
});

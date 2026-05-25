import { describe, expect, it } from "bun:test";
import { buildReadmeEmbed } from "../app/utils/embed";

describe("buildReadmeEmbed", () => {
  it("builds the single-line README snippet for the hosted sponsor page", () => {
    expect(buildReadmeEmbed("https://sponsors.example.test")).toBe(
      "[![Sponsors](https://sponsors.example.test/sponsors.svg)](https://sponsors.example.test)",
    );
  });

  it("normalizes trailing slashes", () => {
    expect(buildReadmeEmbed("https://sponsors.example.test/")).toBe(
      "[![Sponsors](https://sponsors.example.test/sponsors.svg)](https://sponsors.example.test)",
    );
  });
});

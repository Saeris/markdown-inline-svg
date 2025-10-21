import { fileURLToPath } from "node:url";
import { it, describe, expect } from "vitest";
import markdownit from "markdown-it";
import { inlineSVGPlugin } from "../extension.cjs";

describe("markdown-inline-svg", () => {
  const md = markdownit().use(inlineSVGPlugin);

  it(`works`, () => {
    const actual = md.render(`![](./test.svg)`, {
      currentDocument: fileURLToPath(import.meta.url),
    });
    const expected = `<p><svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg"></svg></p>\n`;
    expect(actual).toStrictEqual(expected);
  });
});

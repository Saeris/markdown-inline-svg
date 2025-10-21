// @ts-check
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * @typedef {Object} WebviewResourceProvider
 * @property {(resource: import("vscode").Uri) => import("vscode").Uri} asWebviewUri
 * @property {string} cspSource
 */

/**
 * @typedef {Object} RenderEnv
 * @property {Set<string>} containingImages
 * @property {import("vscode").Uri | undefined} currentDocument
 * @property {WebviewResourceProvider | undefined} resourceProvider;
 */

/** @param {import("markdown-it")} md */
export const inlineSVGPlugin = (md) => {
  const imageRule = md.renderer.rules.image;
  if (!imageRule) return;

  /** @param {RenderEnv} env */
  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const src = token.attrGet(`src`);
    if (
      // src missing
      !src ||
      // is external URL
      /^(?:[a-z]+:|\/\/)/i.test(src) ||
      // src isn't an SVG
      !src?.endsWith(`.svg`) ||
      // VSCode isn't providing the required environment vars
      typeof env.currentDocument === `undefined`
    ) {
      return imageRule(tokens, idx, options, env, self);
    }

    let svgPath = decodeURIComponent(src);

    // If there is a leading slash, means it is an absolute path from the root of the site
    if (svgPath.startsWith(`/`)) {
      svgPath = svgPath.slice(1);
      // Otherwise, it is a relative path from the current file
    } else {
      // Get the directory of the current file first
      const currentFile = env.currentDocument.toString();
      const relativePathDir = fileURLToPath(dirname(currentFile));
      // Resolve the relative path
      svgPath = join(relativePathDir, svgPath);
      // Remove the leading slash if any
      if (svgPath.startsWith(`/`)) svgPath = svgPath.slice(1);
    }

    try {
      // Needs refactoring to work in the browser, but we are limited
      // to sync file reads because of markdown-it
      const svgContent = readFileSync(svgPath, `utf-8`);
      return svgContent;
    } catch (err) {
      console.error(`Could not read SVG file: ${src}`, { cause: err });
      return imageRule(tokens, idx, options, env, self);
    }
  };
};

export const activate = () => ({
  /** @param {import("markdown-it")} md */
  extendMarkdownIt: (md) => md.use(inlineSVGPlugin),
});

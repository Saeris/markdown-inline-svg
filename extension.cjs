import inlineSVGPlugin from "@saeris/markdown-it-inline-svg";

export const activate = () => ({
  extendMarkdownIt: (md) => md.use(inlineSVGPlugin),
});

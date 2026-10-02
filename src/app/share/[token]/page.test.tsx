import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const cleanLegacyBreaks = (markdown: string) =>
  markdown.replace(/<br\s*\/?>/gi, "\n");

const content = [
  "Recapitulando los comandos de hoy:",
  "",
  "* `docker pull` descarga",
  "",
  "**Transición con la siguiente lección:**",
  "",
  "## Un subtítulo",
  "",
  "Bloque de código:",
  "",
  "```js",
  "module.exports = { output: 'standalone' };",
  "```",
  "",
  "***",
].join("\n");

describe("share markdown rendering", () => {
  it("renders bold, headings, lists and code blocks", () => {
    const html = renderToStaticMarkup(
      React.createElement(
        ReactMarkdown,
        { remarkPlugins: [remarkGfm] },
        cleanLegacyBreaks(content)
      )
    );
    expect(html).toContain("<h2");
    expect(html).toContain("<strong>");
    expect(html).toContain("<ul>");
    expect(html).toContain("<code");
    expect(html).toContain("<hr");
  });
});
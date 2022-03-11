// @ts-check

import { createElement as h } from "react";

/**
 * React component that renders a basic HTML page for a server side rendered
 * Ruck app page, with the HTML `lang` set to `"en"` .
 * @type {import("./serve.mjs").HtmlComponent}
 */
export default function Html({
  esModuleShimsScript,
  importMapScript,
  headReactRoot,
  bodyReactRoot,
  hydrationScript,
}) {
  return h(
    "html",
    { lang: "en" },
    h("head", null, esModuleShimsScript, importMapScript, headReactRoot),
    h("body", null, bodyReactRoot, hydrationScript),
  );
}

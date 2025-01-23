// @ts-check

/** @import { HtmlComponent } from "./serve.mjs" */

import { createElement as h } from "react";

/**
 * React component that renders a basic HTML page for a server side rendered
 * Ruck app page, with the HTML `lang` set to `"en"` .
 * @type {HtmlComponent}
 */
export default function Html({
  importMapScript,
  headReactRoot,
  bodyReactRoot,
  hydrationScript,
}) {
  return h(
    "html",
    { lang: "en" },
    h("head", null, importMapScript, headReactRoot),
    h("body", null, bodyReactRoot, hydrationScript),
  );
}

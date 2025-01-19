// @ts-check

import { assertStrictEquals } from "@std/assert/strict-equals";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import Html from "./Html.mjs";

Deno.test("`Html` used as a React component.", () => {
  assertStrictEquals(
    renderToStaticMarkup(
      h(Html, {
        esModuleShimsScript: h("script", { id: "esModuleShimsScript" }),
        importMapScript: h("script", { id: "importMapScript" }),
        headReactRoot: h("meta", { id: "headReactRoot" }),
        bodyReactRoot: h("div", { id: "bodyReactRoot" }),
        hydrationScript: h("script", { id: "hydrationScript" }),
      }),
    ),
    '<html lang="en"><head><script id="esModuleShimsScript"></script><script id="importMapScript"></script><meta id="headReactRoot"/></head><body><div id="bodyReactRoot"></div><script id="hydrationScript"></script></body></html>',
  );
});

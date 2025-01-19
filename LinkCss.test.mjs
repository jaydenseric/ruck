// @ts-check

import { assertStrictEquals } from "@std/assert/strict-equals";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import LinkCss from "./LinkCss.mjs";

Deno.test("`LinkCss` used as a React component, with prop `href` URL absolute.", () => {
  assertStrictEquals(
    renderToStaticMarkup(
      h(LinkCss, {
        href: "https://unpkg.com/device-agnostic-ui@10.0.0/global.css",
      }),
    ),
    '<link rel="stylesheet" href="https://unpkg.com/device-agnostic-ui@10.0.0/global.css" crossorigin="anonymous"/>',
  );
});

Deno.test("`LinkCss` used as a React component, with prop `href` URL relative.", () => {
  assertStrictEquals(
    renderToStaticMarkup(
      h(LinkCss, {
        href: "/global.css",
      }),
    ),
    '<link rel="stylesheet" href="/global.css"/>',
  );
});

// @ts-check

import { suite, test } from "node:test";
import { assertStrictEquals } from "@std/assert/strict-equals";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import LinkCss from "./LinkCss.mjs";

suite("React component `LinkCss`.", {
  concurrency: true,
}, () => {
  test("Prop `href` URL absolute.", () => {
    assertStrictEquals(
      renderToStaticMarkup(
        h(LinkCss, {
          href: "https://unpkg.com/device-agnostic-ui@10.0.0/global.css",
        }),
      ),
      '<link rel="stylesheet" href="https://unpkg.com/device-agnostic-ui@10.0.0/global.css" crossorigin="anonymous"/>',
    );
  });

  test("Prop `href` URL relative.", () => {
    assertStrictEquals(
      renderToStaticMarkup(
        h(LinkCss, {
          href: "/global.css",
        }),
      ),
      '<link rel="stylesheet" href="/global.css"/>',
    );
  });
});

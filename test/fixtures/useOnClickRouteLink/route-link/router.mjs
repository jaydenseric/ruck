// @ts-check

/** @import { Router } from "ruck/serve.mjs" */

import { createElement as h } from "react";
import useOnClickRouteLink from "ruck/useOnClickRouteLink.mjs";

function Page() {
  return h("a", {
    href: "/b",
    onClick: useOnClickRouteLink(),
  }, "b");
}

/** @type {Router} */
export default function router() {
  return { content: h(Page) };
}

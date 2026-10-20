// @ts-check

/**
 * @import { MouseEventHandler } from "react"
 * @import { Router } from "ruck/serve.mjs"
 */

import { createElement as h } from "react";
import useOnClickRouteLink from "ruck/useOnClickRouteLink.mjs";

function Page() {
  const onClickRouteLink = useOnClickRouteLink();

  return h("a", {
    href: "/b",
    /** @satisfies {MouseEventHandler<HTMLAnchorElement>} */
    onClick: (event) => {
      event.preventDefault();
      onClickRouteLink(event);
    },
  }, "b");
}

/** @type {Router} */
export default function router() {
  return {
    content: h(Page),
  };
}

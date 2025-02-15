// @ts-check

/**
 * @import { MouseEvent as ReactMouseEvent } from "react"
 * @import { Router } from "ruck/serve.mjs"
 */

import { createElement as h } from "react";
import useOnClickRouteLink from "ruck/useOnClickRouteLink.mjs";

function PageA() {
  return h(
    "a",
    {
      id: "page-a",
      href: "/b",
      onClick: useOnClickRouteLink(),
    },
    "b",
  );
}

function PageB() {
  const onClickRouteLink = useOnClickRouteLink();

  return h(
    "a",
    {
      id: "page-b",
      href: "/a",
      onClick: (event) => {
        event.preventDefault();
        onClickRouteLink(
          /** @type {ReactMouseEvent<HTMLAnchorElement, MouseEvent>} */ (event),
        );
      },
    },
    "a",
  );
}

/** @type {Router} */
export default function router(url) {
  if (url.pathname === "/") return { content: h(PageA) };
  if (url.pathname === "/b") return { content: h(PageB) };
  return { content: "404" };
}

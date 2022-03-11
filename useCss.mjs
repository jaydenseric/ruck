// @ts-check

import { createElement as h, useMemo } from "react";

import LinkCss from "./LinkCss.mjs";
import useHead from "./useHead.mjs";

/**
 * React hook to use CSS.
 * @param {string} href CSS absolute or relative URL.
 * @param {number} [priority] Priority.
 */
export default function useCss(href, priority) {
  if (typeof href !== "string") {
    throw new TypeError("Argument 1 `href` must be a string.");
  }

  if (priority !== undefined && typeof priority !== "number") {
    throw new TypeError("Argument 2 `priority` must be a number.");
  }

  useHead(
    // Todo: Unopinionated way to name the key.
    `2-${href}`,
    useMemo(
      () => h(LinkCss, { href }),
      [href],
    ),
    priority,
  );
}

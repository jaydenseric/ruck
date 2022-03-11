// @ts-check

import { createElement as h } from "react";

/**
 * React component for linking CSS.
 * @param {object} props Props.
 * @param {string} props.href CSS absolute or relative URL.
 */
export default function LinkCss({ href }) {
  return h("link", {
    rel: "stylesheet",
    href,
    // Allow cross-domain style sheet rules to be read by the system that checks
    // if it’s loaded.
    crossOrigin: href.startsWith("/") ? undefined : "anonymous",
  });
}

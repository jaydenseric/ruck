// @ts-check

/** @import { ReactNode } from "react" */

import { createElement as h, Fragment, useEffect } from "react";

/**
 * A React component that runs a callback after children have mounted.
 * @param {object} props Props.
 * @param {() => void} props.callback Memoized callback.
 * @param {ReactNode} props.children React children.
 */
export default function Effect({ callback, children }) {
  useEffect(callback, [callback]);

  // Fragment is only to make TypeScript happy.
  return h(Fragment, null, children);
}

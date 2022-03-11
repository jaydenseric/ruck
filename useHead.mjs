// @ts-check

import { useContext, useEffect } from "react";

import HeadManagerContext from "./HeadManagerContext.mjs";

/**
 * A React hook to add document head tags while the component is mounted.
 * @param {string} key Head tag fragment key.
 * @param {import("react").ReactNode} content Memoized React content containing
 *   head tags.
 * @param {number} [priority] Priority. Defaults to `0`.
 */
export default function useHead(key, content, priority) {
  if (typeof key !== "string") {
    throw new TypeError("Argument 1 `key` must be a string.");
  }

  if (priority !== undefined && typeof priority !== "number") {
    throw new TypeError("Argument 3 `priority` must be a number.");
  }

  const headManager = useContext(HeadManagerContext);

  if (!headManager) throw TypeError("Context value missing.");

  if (typeof Deno !== "undefined") headManager.add(key, content);

  useEffect(() => {
    headManager.add(key, content, priority);

    return () => {
      headManager.remove(content);
    };
  }, [headManager, key, content, priority]);
}

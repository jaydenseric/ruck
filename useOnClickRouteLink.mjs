// @ts-check

import { useCallback } from "react";

import useNavigate from "./useNavigate.mjs";

/**
 * A React hook to use a click event handler for an `a` element that has a Ruck
 * app route `href`, for client side navigation instead of the browser default
 * full page load. The handler doesn’t do anything if the event default action
 * is already prevented, if a non main mouse button was pressed, or if any of
 * the following keys were pressed during the click:
 *
 * - Alt (in Safari, downloads the link)
 * - Control (in Safari, displays the link context menu)
 * - Meta (in Safari, opens the link in a new tab)
 * - Shift (in Safari, adds the link to Reading List)
 */
export default function useOnClickRouteLink() {
  const navigate = useNavigate();

  return useCallback(
    /** @type {import("react").MouseEventHandler<HTMLAnchorElement>} */
    (event) => {
      if (
        !event.defaultPrevented &&
        event.currentTarget instanceof HTMLAnchorElement &&
        // The main mouse button was pressed, or the enter key was pressed while
        // the link was focused.
        event.button === 0 &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.shiftKey
      ) {
        if (!navigate) throw new TypeError("Context value missing.");
        event.preventDefault();
        navigate({ url: event.currentTarget.href });
      }
    },
    [navigate],
  );
}

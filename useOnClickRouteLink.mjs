// @ts-check
/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

import { useCallback } from "react";

import useNavigate from "./useNavigate.mjs";

/**
 * A React hook to use a click event handler for an `a` tag that has a Ruck app
 * route `href`, for client side navigation instead of the browser default full
 * page load.
 */
export default function useOnClickRouteLink() {
  const navigate = useNavigate();

  return useCallback(
    /** @type {import("react").MouseEventHandler<HTMLAnchorElement>} */
    (event) => {
      if (event.currentTarget instanceof HTMLAnchorElement) {
        if (!navigate) throw new TypeError("Context value missing.");
        event.preventDefault();
        navigate({ url: event.currentTarget.href });
      }
    },
    [navigate],
  );
}

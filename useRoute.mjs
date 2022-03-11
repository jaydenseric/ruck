// @ts-check

import { useContext } from "react";

import RouteContext from "./RouteContext.mjs";

/** A React hook to use the current Ruck app route. */
export default function useRoute() {
  const route = useContext(RouteContext);
  if (!route) throw TypeError("Context value missing.");
  return route;
}

// @ts-check

import { createContext } from "react";

/** React context that holds the Ruck app route. */
const c = createContext(
  /** @type {import("./serve.mjs").Route | undefined} */ (undefined),
);

c.displayName = "RouteContext";

export default c;

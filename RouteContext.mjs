// @ts-check

/** @import { Route } from "./serve.mjs" */

import { createContext } from "react";

/** React context that holds the Ruck app route. */
const c = createContext(/** @type {Route | undefined} */ (undefined));

c.displayName = "RouteContext";

export default c;

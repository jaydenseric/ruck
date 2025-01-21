// @ts-check

/** @import { Navigate } from "./ClientProvider.mjs" */

import { createContext } from "react";

/** React context for the function used to navigate to a Ruck app route. */
const c = createContext(/** @type {Navigate | undefined} */ (undefined));

c.displayName = "NavigateContext";

export default c;

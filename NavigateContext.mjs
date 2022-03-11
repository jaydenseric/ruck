// @ts-check

import { createContext } from "react";

/** React context for the function used to navigate to a Ruck app route. */
const c = createContext(
  /**
   * @type {import("./ClientProvider.mjs").Navigate | undefined}
   */ (undefined),
);

c.displayName = "NavigateContext";

export default c;

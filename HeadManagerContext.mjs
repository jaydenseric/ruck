// @ts-check

import { createContext } from "react";

/** React context to provide the head tag manager. */
const c = createContext(
  /** @type {import("./HeadManager.mjs").default | undefined} */ (undefined),
);

c.displayName = "HeadManagerContext";

export default c;

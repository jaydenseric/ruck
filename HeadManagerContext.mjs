// @ts-check

/** @import HeadManager from "./HeadManager.mjs" */

import { createContext } from "react";

/** React context to provide the head tag manager. */
const c = createContext(/** @type {HeadManager | undefined} */ (undefined));

c.displayName = "HeadManagerContext";

export default c;

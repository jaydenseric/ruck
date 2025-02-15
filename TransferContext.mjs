// @ts-check

/** @import { Transfer } from "./serve.mjs" */

import { createContext } from "react";

/**
 * React context to provide the Ruck app request and response context. The
 * value should only be populated on the server.
 */
const c = createContext(/** @type {Transfer | undefined} */ (undefined));

c.displayName = "TransferContext";

export default c;

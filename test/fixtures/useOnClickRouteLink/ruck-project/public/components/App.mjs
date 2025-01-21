// @ts-check

/** @import { AppComponent } from "ruck/serve.mjs" */

import { createElement as h, Fragment } from "react";
import useRoute from "ruck/useRoute.mjs";

/** @type {AppComponent} */
export default function App() {
  return h(Fragment, null, useRoute().content);
}

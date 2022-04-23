// @ts-check

import { createElement as h, Fragment } from "react";
import useRoute from "ruck/useRoute.mjs";

/** @type {import("ruck/serve.mjs").AppComponent} */
export default function App() {
  return h(Fragment, null, useRoute().content);
}

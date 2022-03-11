// @ts-check

import { createElement as h, Fragment } from "react";
import { assertRejects } from "std/testing/asserts.ts";

import hydrate from "./hydrate.mjs";

Deno.test("`hydrate` with option `router` not a function.", async () => {
  await assertRejects(
    () =>
      hydrate({
        appComponent: () => h(Fragment),
        // @ts-expect-error Testing invalid.
        router: true,
        cacheData: {},
      }),
    TypeError,
    "Option `router` must be a function.",
  );
});

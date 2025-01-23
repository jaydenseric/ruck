// @ts-check

import { assertRejects } from "@std/assert/rejects";

import serve from "./serve.mjs";

Deno.test("`serve` with option `clientImportMap` not an import map object or `URL` instance.", async () => {
  await assertRejects(
    () =>
      serve({
        // @ts-expect-error Testing invalid.
        clientImportMap: true,
        port: 3000,
      }),
    TypeError,
    "Option `clientImportMap` must be an import map object or `URL` instance.",
  );
});

Deno.test("`serve` with option `clientImportMap` an invalid import map object.", async () => {
  await assertRejects(
    () =>
      serve({
        clientImportMap: {
          // @ts-expect-error Testing invalid.
          imports: true,
        },
        port: 3000,
      }),
    TypeError,
    "Option `clientImportMap` must be an import map object.",
  );
});

Deno.test("`serve` with option `publicDir` not a `URL` instance.", async () => {
  await assertRejects(
    () =>
      serve({
        clientImportMap: new URL("./importMap.json", import.meta.url),
        // @ts-expect-error Testing invalid.
        publicDir: true,
        port: 3000,
      }),
    TypeError,
    "Option `publicDir` must be a `URL` instance.",
  );
});

Deno.test(
  "`serve` with option `publicDir` not a URL ending with `/`.",
  async () => {
    await assertRejects(
      () =>
        serve({
          clientImportMap: new URL("./importMap.json", import.meta.url),
          publicDir: new URL(import.meta.url),
          port: 3000,
        }),
      TypeError,
      "Option `publicDir` must be a URL ending with `/`.",
    );
  },
);

Deno.test("`serve` with option `htmlComponent` not a function.", async () => {
  await assertRejects(
    () =>
      serve({
        clientImportMap: new URL("./importMap.json", import.meta.url),
        port: 3000,
        // @ts-expect-error Testing invalid.
        htmlComponent: true,
      }),
    TypeError,
    "Option `htmlComponent` must be a function.",
  );
});

Deno.test("`serve` with option `port` not a number.", async () => {
  await assertRejects(
    () =>
      serve({
        clientImportMap: new URL("./importMap.json", import.meta.url),
        // @ts-expect-error Testing invalid.
        port: true,
      }),
    TypeError,
    "Option `port` must be a number.",
  );
});

Deno.test(
  "`serve` with option `signal` not an `AbortSignal` instance.",
  async () => {
    await assertRejects(
      () =>
        serve({
          clientImportMap: new URL("./importMap.json", import.meta.url),
          port: 3000,
          // @ts-expect-error Testing invalid.
          signal: true,
        }),
      TypeError,
      "Option `signal` must be an `AbortSignal` instance.",
    );
  },
);

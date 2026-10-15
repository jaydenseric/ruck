// @ts-check

import { suite, test } from "node:test";
import { assertRejects } from "@std/assert/rejects";

import serve from "./serve.mjs";

suite("Function `serve`.", {
  concurrency: true,
}, () => {
  test("Option `clientImportMap` not an import map object or `URL` instance.", async () => {
    await assertRejects(
      () =>
        serve({
          // @ts-expect-error Testing invalid.
          clientImportMap: true,
        }),
      TypeError,
      "Option `clientImportMap` must be an import map object or `URL` instance.",
    );
  });

  test("Option `clientImportMap` an invalid import map object.", async () => {
    await assertRejects(
      () =>
        serve({
          clientImportMap: {
            // @ts-expect-error Testing invalid.
            imports: true,
          },
        }),
      TypeError,
      "Option `clientImportMap` must be an import map object.",
    );
  });

  test("Option `publicDir` not a `URL` instance.", async () => {
    await assertRejects(
      () =>
        serve({
          clientImportMap: new URL("./importMap.json", import.meta.url),
          // @ts-expect-error Testing invalid.
          publicDir: true,
        }),
      TypeError,
      "Option `publicDir` must be a `URL` instance.",
    );
  });

  test(
    "Option `publicDir` not a URL ending with `/`.",
    async () => {
      await assertRejects(
        () =>
          serve({
            clientImportMap: new URL("./importMap.json", import.meta.url),
            publicDir: new URL(import.meta.url),
          }),
        TypeError,
        "Option `publicDir` must be a URL ending with `/`.",
      );
    },
  );

  test("Option `htmlComponent` not a function.", async () => {
    await assertRejects(
      () =>
        serve({
          clientImportMap: new URL("./importMap.json", import.meta.url),
          // @ts-expect-error Testing invalid.
          htmlComponent: true,
        }),
      TypeError,
      "Option `htmlComponent` must be a function.",
    );
  });

  test("Option `port` not a number.", async () => {
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

  test(
    "Option `signal` not an `AbortSignal` instance.",
    async () => {
      await assertRejects(
        () =>
          serve({
            clientImportMap: new URL("./importMap.json", import.meta.url),
            // @ts-expect-error Testing invalid.
            signal: true,
          }),
        TypeError,
        "Option `signal` must be an `AbortSignal` instance.",
      );
    },
  );
});

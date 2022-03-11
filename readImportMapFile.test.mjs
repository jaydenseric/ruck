// @ts-check

import {
  assertEquals,
  assertIsError,
  assertRejects,
  fail,
} from "std/testing/asserts.ts";

import readImportMapFile from "./readImportMapFile.mjs";

Deno.test(
  "`readImportMapFile` with argument 1 `importMapFileUrl` not a `URL` instance.",
  async () => {
    await assertRejects(
      () =>
        readImportMapFile(
          // @ts-expect-error Testing invalid.
          true,
        ),
      TypeError,
      "Argument 1 `importMapFileUrl` must be a `URL` instance.",
    );
  },
);

Deno.test(
  "`readImportMapFile` with a missing file.",
  async () => {
    const importMapFileUrl = new URL(
      "./test/fixtures/readImportMapFile/import-map-missing.json",
      import.meta.url,
    );

    try {
      await readImportMapFile(importMapFileUrl);
      fail();
    } catch (error) {
      assertIsError(
        error,
        Error,
        `Error reading import map file \`${importMapFileUrl.href}\`.`,
      );
      assertIsError(
        error.cause,
        Deno.errors.NotFound,
      );
    }
  },
);

Deno.test(
  "`readImportMapFile` with invalid JSON.",
  async () => {
    const importMapFileUrl = new URL(
      "./test/fixtures/readImportMapFile/import-map-invalid-json.txt",
      import.meta.url,
    );

    try {
      await readImportMapFile(importMapFileUrl);
      fail();
    } catch (error) {
      assertIsError(
        error,
        Error,
        `Invalid JSON in import map file \`${importMapFileUrl.href}\`.`,
      );
      assertIsError(error.cause, SyntaxError);
    }
  },
);

Deno.test(
  "`readImportMapFile` with invalid import map.",
  async () => {
    const importMapFileUrl = new URL(
      "./test/fixtures/readImportMapFile/import-map-invalid-content.json",
      import.meta.url,
    );

    try {
      await readImportMapFile(importMapFileUrl);
      fail();
    } catch (error) {
      assertIsError(
        error,
        Error,
        `Invalid content in import map file \`${importMapFileUrl.href}\`.`,
      );
      assertIsError(error.cause, TypeError, "Invalid import map.");
      assertIsError(
        error.cause.cause,
        TypeError,
        "Import map property `imports` must be an object.",
      );
    }
  },
);

Deno.test(
  "`readImportMapFile` with valid import map.",
  async () => {
    const importMapFileUrl = new URL(
      "./test/fixtures/readImportMapFile/import-map-valid.json",
      import.meta.url,
    );

    /** @type {import("./assertImportMap.mjs").ImportMap} */
    const importMap = await readImportMapFile(importMapFileUrl);

    assertEquals(
      importMap,
      {
        "imports": {
          "a/": "/a/",
        },
        "scopes": {
          "/a/": {
            "b": "/c",
          },
        },
      },
    );
  },
);

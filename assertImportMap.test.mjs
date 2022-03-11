// @ts-check

import { assertIsError, fail } from "std/testing/asserts.ts";

import assertImportMap from "./assertImportMap.mjs";

Deno.test(
  "`assertImportMap` with import map invalid, not an object.",
  () => {
    try {
      assertImportMap(null);
      fail();
    } catch (error) {
      assertIsError(error, TypeError, "Invalid import map.");
      assertIsError(error.cause, TypeError, "Import map must be an object.");
    }
  },
);

Deno.test(
  "`assertImportMap` with import map invalid, property `imports` not an object.",
  () => {
    try {
      assertImportMap(
        Object.freeze({
          imports: null,
        }),
      );
      fail();
    } catch (error) {
      assertIsError(error, TypeError, "Invalid import map.");
      assertIsError(
        error.cause,
        TypeError,
        "Import map property `imports` must be an object.",
      );
    }
  },
);

Deno.test(
  "`assertImportMap` with import map invalid, property `imports` containing an entry with key empty.",
  () => {
    try {
      assertImportMap(
        Object.freeze({
          imports: Object.freeze({
            "": "/",
          }),
        }),
      );
      fail();
    } catch (error) {
      assertIsError(error, TypeError, "Invalid import map.");
      assertIsError(
        error.cause,
        TypeError,
        "Import map property `imports` mustn’t contain an empty key.",
      );
    }
  },
);

Deno.test(
  "`assertImportMap` with import map invalid, property `imports` containing an entry with value a non string.",
  () => {
    try {
      assertImportMap(
        Object.freeze({
          imports: Object.freeze({
            "a": true,
          }),
        }),
      );
      fail();
    } catch (error) {
      assertIsError(error, TypeError, "Invalid import map.");
      assertIsError(
        error.cause,
        TypeError,
        "Import map property `imports` property `a` must be a string.",
      );
    }
  },
);

Deno.test(
  "`assertImportMap` with import map invalid, property `imports` containing an entry with value an empty string.",
  () => {
    try {
      assertImportMap(
        Object.freeze({
          imports: Object.freeze({
            "a": "",
          }),
        }),
      );
      fail();
    } catch (error) {
      assertIsError(error, TypeError, "Invalid import map.");
      assertIsError(
        error.cause,
        TypeError,
        "Import map property `imports` property `a` must be a non empty string.",
      );
    }
  },
);

Deno.test(
  "`assertImportMap` with import map invalid, property `scopes` not an object.",
  () => {
    try {
      assertImportMap(
        Object.freeze({
          scopes: null,
        }),
      );
      fail();
    } catch (error) {
      assertIsError(error, TypeError, "Invalid import map.");
      assertIsError(
        error.cause,
        TypeError,
        "Import map property `scopes` must be an object.",
      );
    }
  },
);

Deno.test(
  "`assertImportMap` with import map invalid, property `scopes` containing an entry with key empty.",
  () => {
    try {
      assertImportMap(
        Object.freeze({
          scopes: Object.freeze({
            "": "/",
          }),
        }),
      );
      fail();
    } catch (error) {
      assertIsError(error, TypeError, "Invalid import map.");
      assertIsError(
        error.cause,
        TypeError,
        "Import map property `scopes` mustn’t contain an empty key.",
      );
    }
  },
);

Deno.test(
  "`assertImportMap` with import map invalid, property `scopes` containing an entry with value not an object.",
  () => {
    try {
      assertImportMap(
        Object.freeze({
          scopes: Object.freeze({
            "a": null,
          }),
        }),
      );
      fail();
    } catch (error) {
      assertIsError(error, TypeError, "Invalid import map.");
      assertIsError(
        error.cause,
        TypeError,
        "Import map property `scopes` property `a` must be an object.",
      );
    }
  },
);

Deno.test(
  "`assertImportMap` with import map invalid, property `scopes` containing an entry that contains an entry with key empty.",
  () => {
    try {
      assertImportMap(
        Object.freeze({
          scopes: Object.freeze({
            "/a/": Object.freeze({
              "": "/c",
            }),
          }),
        }),
      );
      fail();
    } catch (error) {
      assertIsError(error, TypeError, "Invalid import map.");
      assertIsError(
        error.cause,
        TypeError,
        "Import map property `scopes` property `/a/` mustn’t contain an empty key.",
      );
    }
  },
);

Deno.test(
  "`assertImportMap` with import map invalid, property `scopes` containing an entry that contains an entry with value not a string.",
  () => {
    try {
      assertImportMap(
        Object.freeze({
          scopes: Object.freeze({
            "/a/": Object.freeze({
              "b": true,
            }),
          }),
        }),
      );
      fail();
    } catch (error) {
      assertIsError(error, TypeError, "Invalid import map.");
      assertIsError(
        error.cause,
        TypeError,
        "Import map property `scopes` property `/a/` property `b` must be a string.",
      );
    }
  },
);

Deno.test(
  "`assertImportMap` with import map invalid, property `scopes` containing an entry that contains an entry with value an empty string.",
  () => {
    try {
      assertImportMap(
        Object.freeze({
          scopes: Object.freeze({
            "/a/": Object.freeze({
              "b": "",
            }),
          }),
        }),
      );
      fail();
    } catch (error) {
      assertIsError(error, TypeError, "Invalid import map.");
      assertIsError(
        error.cause,
        TypeError,
        "Import map property `scopes` property `/a/` property `b` must be a non empty string.",
      );
    }
  },
);

Deno.test(
  "`assertImportMap` with import map valid, property `imports` without entries.",
  () => {
    assertImportMap(
      Object.freeze({
        imports: Object.freeze({}),
      }),
    );
  },
);

Deno.test(
  "`assertImportMap` with import map valid, property `scopes` without entries.",
  () => {
    assertImportMap(
      Object.freeze({
        imports: Object.freeze({}),
      }),
    );
  },
);

Deno.test(
  "`assertImportMap` with import map valid, properties `imports` and `scopes` with entries.",
  () => {
    assertImportMap(
      Object.freeze({
        imports: Object.freeze({
          "a/": "/a/",
        }),
        scopes: Object.freeze({
          "/a/": Object.freeze({
            "b": "/c",
          }),
        }),
      }),
    );
  },
);

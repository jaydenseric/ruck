// @ts-check

import { suite, test } from "node:test";
import { fail } from "@std/assert/fail";
import { assertIsError } from "@std/assert/is-error";

import assertImportMap from "./assertImportMap.mjs";

suite("Function `assertImportMap`.", {
  concurrency: true,
}, () => {
  suite("Import map invalid.", {
    concurrency: true,
  }, () => {
    test(
      "Not an object.",
      () => {
        try {
          assertImportMap(null);
          fail();
        } catch (error) {
          assertIsError(error, TypeError, "Invalid import map.");
          assertIsError(
            error.cause,
            TypeError,
            "Import map must be an object.",
          );
        }
      },
    );

    test(
      "Property `imports` not an object.",
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

    test(
      "Property `imports` containing an entry with key empty.",
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

    test(
      "Property `imports` containing an entry with value a non string.",
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

    test(
      "Property `imports` containing an entry with value an empty string.",
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

    test(
      "Property `scopes` not an object.",
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

    test(
      "Property `scopes` containing an entry with key empty.",
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

    test(
      "Property `scopes` containing an entry with value not an object.",
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

    test(
      "Property `scopes` containing an entry that contains an entry with key empty.",
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

    test(
      "Property `scopes` containing an entry that contains an entry with value not a string.",
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

    test(
      "Property `scopes` containing an entry that contains an entry with value an empty string.",
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
  });

  suite("Import map valid.", {
    concurrency: true,
  }, () => {
    test(
      "Property `imports` without entries.",
      () => {
        assertImportMap(
          Object.freeze({
            imports: Object.freeze({}),
          }),
        );
      },
    );

    test(
      "Property `scopes` without entries.",
      () => {
        assertImportMap(
          Object.freeze({
            imports: Object.freeze({}),
          }),
        );
      },
    );

    test(
      "Properties `imports` and `scopes` with entries.",
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
  });
});

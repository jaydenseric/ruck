// @ts-check

import { createElement as h } from "react";
import { act, create } from "react-test-renderer";
import { assertEquals, assertStrictEquals } from "std/testing/asserts.ts";

import Effect from "./Effect.mjs";

Deno.test("`Effect` functionality.", () => {
  /** @type {Array<{ callback: Function, args: Array<unknown> }>} */
  const callbackCalls = [];

  /** @param {Array<unknown>} args */
  function callbackOuterA(...args) {
    callbackCalls.push({ callback: callbackOuterA, args });
  }

  /** @param {Array<unknown>} args */
  function callbackOuterB(...args) {
    callbackCalls.push({ callback: callbackOuterB, args });
  }

  /** @param {Array<unknown>} args */
  function callbackInner(...args) {
    callbackCalls.push({ callback: callbackInner, args });
  }

  const children = "abc";

  /** @type {import("react-test-renderer").ReactTestRenderer | undefined} */
  let testRenderer;

  act(() => {
    // When mounted, callbacks should be called in nested first order.
    testRenderer = create(
      h(Effect, {
        callback: callbackOuterA,
        children: h(Effect, {
          callback: callbackInner,
          children,
        }),
      }),
    );
  });

  const tr =
    /** @type {import("react-test-renderer").ReactTestRenderer} */
    (testRenderer);

  assertEquals(callbackCalls, [
    { callback: callbackInner, args: [] },
    { callback: callbackOuterA, args: [] },
  ]);
  assertStrictEquals(tr.toJSON(), children);

  act(() => {
    // When mounted, re-rendering shouldn’t result in the callbacks being called
    // again.
    tr.update(
      h(Effect, {
        callback: callbackOuterA,
        children: h(Effect, {
          callback: callbackInner,
          children,
        }),
      }),
    );
  });

  assertEquals(callbackCalls, [
    { callback: callbackInner, args: [] },
    { callback: callbackOuterA, args: [] },
  ]);
  assertStrictEquals(tr.toJSON(), children);

  act(() => {
    // When mounted, re-rendering with a different callback should result in it
    // being called.
    tr.update(
      h(Effect, {
        callback: callbackOuterB,
        children: h(Effect, {
          callback: callbackInner,
          children,
        }),
      }),
    );
  });

  assertEquals(callbackCalls, [
    { callback: callbackInner, args: [] },
    { callback: callbackOuterA, args: [] },
    { callback: callbackOuterB, args: [] },
  ]);
  assertStrictEquals(tr.toJSON(), children);
});

// @ts-check

import {
  createElement as h,
  Fragment,
  useCallback,
  useEffect,
  useState,
} from "react";

/** @type {Promise<void> | null} */
let updatePromise;

/**
 * React component that renders the managed document head tags in response to
 * head manager `update` events.
 * @param {object} props Props.
 * @param {import("./HeadManager.mjs").default} props.headManager Head manager.
 */
export default function HeadContent({ headManager }) {
  const [content, setContent] = useState(() => headManager.getHeadContent());

  const onUpdate = useCallback(() => {
    // Handle close together updates as a batch to reduce renders.
    const promise = (updatePromise = Promise.resolve().then(() => {
      if (promise !== updatePromise) return;
      updatePromise = null;
      setContent(headManager.getHeadContent());
    }));
  }, [headManager]);

  useEffect(() => {
    headManager.addEventListener("update", onUpdate);

    return () => {
      headManager.removeEventListener("update", onUpdate);
    };
  }, [headManager, onUpdate]);

  // Fragment is only to make TypeScript happy.
  return h(Fragment, null, content);
}

// @ts-check

/**
 * React component for testing a React hook.
 * @param {object} props Props.
 * @param {() => unknown} props.hook React hook.
 * @param {Array<unknown>} props.results Results of each render; the hook return
 *   value or error.
 */
export default function ReactHookTest({ hook, results }) {
  let result;

  try {
    result = hook();
  } catch (error) {
    result = error;
  }

  results.push(result);

  return null;
}

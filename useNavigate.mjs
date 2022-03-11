// @ts-check

import { useContext, useDebugValue } from "react";

import NavigateContext from "./NavigateContext.mjs";

/**
 * A React hook to use the `navigate` function for navigating Ruck app routes.
 */
export default function useNavigate() {
  const navigate = useContext(NavigateContext);
  useDebugValue(navigate);
  return navigate;
}

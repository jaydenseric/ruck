// @ts-check

/**
 * Creates a pseudo DOM node that acts like a parent node for a real DOM node’s
 * child nodes that are between a start and end DOM node, suitable for use as a
 * React app root to hydrate and render tags in a region of the document head
 * where a real DOM node can’t be used to group child nodes.
 *
 * Only the exact DOM functionality used internally by React is supported; in
 * the future Preact support may be added.
 * @see https://github.com/preactjs/preact/issues/3285
 * @param {ChildNode} startNode Start DOM node.
 * @param {ChildNode} endNode End DOM node.
 */
export default function createPseudoNode(startNode, endNode) {
  if (!(startNode instanceof Node)) {
    throw new TypeError("Argument 1 `startNode` must be a DOM node.");
  }

  if (!(endNode instanceof Node)) {
    throw new TypeError("Argument 2 `endNode` must be a DOM node.");
  }

  if (!startNode.parentNode) throw new TypeError("Parent DOM node missing.");

  if (startNode.parentNode !== endNode.parentNode) {
    throw new TypeError("Start and end DOM nodes must have the same parent.");
  }

  /**
   * @param {ChildNode} childNode
   * @returns {ChildNode}
   */
  function proxyChildNode(childNode) {
    return new Proxy(childNode, {
      get: function (target, propertyKey) {
        switch (propertyKey) {
          case "nextSibling": {
            return childNode.nextSibling && childNode.nextSibling !== endNode
              ? proxyChildNode(childNode.nextSibling)
              : null;
          }

          case "valueOf": {
            return () => target;
          }

          default: {
            const value = Reflect.get(target, propertyKey, target);
            return typeof value === "function" ? value.bind(target) : value;
          }
        }
      },
    });
  }

  return /** @type {ParentNode} **/ (
    new Proxy(startNode.parentNode, {
      get: function (target, propertyKey) {
        switch (propertyKey) {
          case "firstChild": {
            return startNode.nextSibling && startNode.nextSibling !== endNode
              ? proxyChildNode(startNode.nextSibling)
              : null;
          }

          case "appendChild": {
            return /** @param {Node} node */ (node) =>
              target.insertBefore(node, endNode);
          }

          case "removeChild": {
            return /** @param {ChildNode} node */ (node) =>
              target.removeChild(/** @type {ChildNode} */ (node.valueOf()));
          }

          case "insertBefore": {
            return (
              /**
               * @param {Node} newNode
               * @param {ChildNode} referenceNode
               */
              (newNode, referenceNode) =>
                target.insertBefore(
                  /** @type {Node} */ (newNode.valueOf()),
                  /** @type {ChildNode} */ (referenceNode.valueOf()),
                )
            );
          }

          default: {
            const value = Reflect.get(target, propertyKey, target);
            return typeof value === "function" ? value.bind(target) : value;
          }
        }
      },
    })
  );
}

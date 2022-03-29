# Ruck changelog

## 2.0.0

### Major

- Route related function/module names and types have been improved to clarify in
  which situations route content may be a promise. When a route is being
  prepared and may have a promise for content it’s called a “route plan”, and
  when the resolved content renders it’s just called a “route”. The word “plan”
  was chosen because sometimes navigation to a route doesn’t go according to
  plan; the content promise (typically from a dynamic import) could reject or
  the navigation could be aborted before the content promise resolves and is
  ready to render.
  - Renamed the function/module `routeDetailsForContentWithCss.mjs` to
    `routePlanForContentWithCss.mjs`.
  - The `Router` type (from `serve.mjs`) intended for the default export of a
    project `public/router.mjs` module now returns a new `RoutePlan` type (also
    from `serve.mjs`) instead of `RouteDetails`, which has been removed.
  - The `Route` type (from `serve.mjs`) for the `RouteContext` React context
    value that the `useRoute` React hook returns no longer suggests the
    `content` property could be a promise. This type was previously used for
    both when a route was planned and rendering, and while it’s ok to plan a
    route without using a promise for the content, it created the false
    impression that the content for a rendered route might be a promise.
  - Reworded several error messages within `serve.mjs`.

### Patch

- Updated dependencies.
- Fixed a readme code example comment typo.
- Improved the readme code example for a Ruck app component.

## 1.1.0

### Minor

- The Ruck app server request handler created by the `serve` function from
  `serve.mjs` now reads the request headers `x-forwarded-proto` and
  `x-forwarded-host` when determining the route URL, which should be what the
  client originally used to start the request. Reverse proxy servers (load
  balancers, CDNs, etc.) may forward client requests to the Ruck app server
  using a different protocol or host. E.g. [Fly.io](https://fly.io) forwards
  `https:` requests to the deployed server using `http:`.

### Patch

- Fixed relative URLs to project files in the readme.
- Corrected an example shell script in the readme.
- Tweaked example code in the readme.
- Removed a redundant image from the `.github` directory.

## 1.0.0

Initial release.

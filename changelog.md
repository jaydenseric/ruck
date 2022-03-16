# Ruck changelog

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

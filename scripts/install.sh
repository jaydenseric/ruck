#! /bin/sh
# Installs Ruck development dependencies (primarily Puppeteer).

deno run \
  --allow-env \
  --allow-net \
  --allow-read \
  --allow-write \
  https://deno.land/x/puppeteer@16.2.0/install.ts

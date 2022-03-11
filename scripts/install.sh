#! /bin/sh
# Installs Ruck development dependencies (primarily Puppeteer).

deno run \
  --unstable \
  --allow-env \
  --allow-net \
  --allow-read \
  --allow-write \
  https://deno.land/x/puppeteer@9.0.2/install.ts

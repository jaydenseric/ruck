#! /bin/sh
# Serves the Ruck project files for testing in other local projects.

if [ -z "$1" ]; then
  echo "Argument 1 must be the port to serve on."
  exit 1
fi

deno run \
  --allow-net \
  --allow-read \
  jsr:@std/http/file-server \
    --port=$1 \
    --cors

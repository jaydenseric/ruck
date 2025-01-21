#! /bin/sh
# Type checks every JavaScript module in the project.

deno check --allow-import "**/*.mjs"

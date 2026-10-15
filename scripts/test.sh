#! /bin/sh
# Runs the Ruck tests and reports code coverage.

deno test --allow-all --clean --coverage --no-check

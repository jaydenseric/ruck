#! /bin/sh
# Runs the Ruck tests and reports code coverage.

# Run the tests and collect code coverage raw data.
deno test --allow-all --clean --coverage --coverage-raw-data-only --no-check &&

# Report code coverage.
deno coverage --exclude="/test/"

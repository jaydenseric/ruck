#! /bin/sh
# Runs the Ruck tests and reports code coverage.

# Run the tests with code coverage.
deno test \
  --unstable \
  --allow-env \
  --allow-net \
  --allow-run \
  --allow-read \
  --allow-write \
  --coverage=.coverage &&

# Report code coverage.
deno coverage \
  --exclude=[\/.]test[\/.] \
  .coverage

# Test and code coverage status.
testStatus="$?"

# Clean the code coverage data.
rm -rf .coverage &&

# If cleaning the code coverage data succeeded, exit with the test and code
# coverage status.
exit $testStatus

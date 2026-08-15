# Production Notes

## Memory Vault resilience

The Memory Vault now has a client-side timeout and deterministic session fallback. A slow or unavailable AI provider cannot leave the Create memory button permanently stuck in a loading state. The AI adapter also times out upstream provider requests so serverless functions return control instead of hanging indefinitely.

This is an availability safeguard, not a replacement for configured AI credentials.

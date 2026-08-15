# BARKVERSE

> **What if dogs had their own internet?**

BARKVERSE is a playful, AI-powered dog civilization built for the DEV Weekend Challenge: Dog Days Edition.

The experience is deliberately designed to move through **fun → interaction → voice → emotion** rather than behaving like a conventional pet dashboard.

## Competition target

- Overall winner
- Best use of Google AI
- Best use of ElevenLabs
- Best use of Solana
- Best use of Snowflake

## Core journey

Upload dog → AI discovers personality → enter BARKVERSE → investigate a human case → play Barkcade → talk to the dog → create a memory → optionally preserve a Pawprint on Solana devnet → inspect the Barkverse Observatory.

## Technology roles

### Google AI
Primary multimodal intelligence for dog discovery, personality, dialogue and memory generation.

### OpenRouter
`openrouter/free` is the resilience layer. It is used only when the primary Google AI request is unavailable and the requested capability is compatible. The application also has deterministic fallbacks so the demo does not collapse when providers are unavailable.

### ElevenLabs
Turns generated dog dialogue into an actual dog character voice. Browser speech is only the graceful fallback when ElevenLabs is not configured.

### Solana
Pawprint uses a Solana devnet Memo transaction to preserve a lightweight, user-approved proof of a memory. Private photos and stories are not written on-chain.

### Snowflake
Anonymous event telemetry can be stored through the Snowflake SQL API and queried by the Barkverse Observatory. `snowflake/schema.sql` contains the event table and view.

## Environment setup

Copy `.env.example` to `.env.local` for local development, or add the variables to **Vercel Project Settings → Environment Variables** for deployment.

**Never commit real API keys.**

Full integrations support:

```text
GOOGLE_AI_API_KEY=
OPENROUTER_API_KEY=
ELEVENLABS_API_KEY=
```

Optional Snowflake variables are documented in `.env.example`.

Solana Pawprint uses the browser wallet on **devnet** and does not require a server-side private key.

## Security

- Secrets stay server-side.
- `.env*` is ignored by Git.
- Private photos are not stored on-chain.
- No speculative token economy is used.
- Solana is devnet-only for the challenge prototype.
- AI failures degrade to deterministic responses instead of exposing provider errors to the user.

## Deployment

The project is intentionally dependency-light and can be deployed as a static site plus Vercel Functions. `vercel.json` maps the root route to `app/index.html` while `/api/*` remains available for server-side integrations.

## Challenge build history

The repository was initialized and developed during the challenge window. Commit history is intentionally incremental so the build process remains auditable.

## Submission readiness

Feature work is frozen for the challenge. Final verification focuses on the production deployment, provider configuration, camera/gallery flow, dog gate, AI discovery, voice fallback, memory, Solana fee/confirmation flow, responsive layout, and final DEV submission article/demo links.

## Status

**Submission candidate — August 15, 2026.**

The current branch contains the AI gateway, OpenRouter fallback path, dog discovery API, voice API, memory API, Snowflake telemetry/observatory adapter, Solana devnet Pawprint flow, Barkcade Treat Dash, BARKINDER discovery, multilingual onboarding and help experience.

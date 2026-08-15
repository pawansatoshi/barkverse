# BARKVERSE Architecture

```text
                         BARKVERSE
                             |
                  +----------+----------+
                  |                     |
               FRONTEND              API LAYER
                  |                     |
                  +----------+----------+
                             |
                    BARKVERSE AI GATEWAY
                             |
                 +-----------+-----------+
                 |                       |
            Google AI              OpenRouter/free
             primary                 fallback
                 |                       |
                 +-----------+-----------+
                             |
                     BARKVERSE ENGINE
                       /     |      \\
                      /      |       \\
               ElevenLabs  Solana   Snowflake
                  voice    Pawprint  Observatory
```

## Provider strategy

### Primary

Google AI for multimodal dog understanding, personality, dialogue, missions and memory generation.

### Fallback

OpenRouter `openrouter/free`, capability-aware. Do not hard-code a single free model. Cache generated results and avoid retry loops.

### Graceful degradation

If AI providers fail, the UI should never become a blank error state. Deterministic templates provide a demo-safe fallback for core character content.

## Privacy

- Never expose API keys in the browser.
- Keep private photos and stories off-chain.
- Store only the minimum information required.
- Solana stores a proof/reference, not private memory content.

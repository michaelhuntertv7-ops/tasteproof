# TasteProof

**Cultural regression testing for AI agents, powered by Qloo.**

TasteProof tests whether adding Qloo materially improves an agent's cultural recommendations rather than merely making them sound plausible.

## Judge path

1. Pick a scenario and run the clearly labeled **illustrative fixture** to understand the regression-report UX.
2. Run **Live Qloo evaluation** when the event credential is configured.
3. Inspect evidence provenance, bounded execution, and the SHA-256 run digest.
4. A live Qloo failure fails closed; TasteProof never substitutes fixture data for live evidence.

## Why Qloo matters

The baseline agent can produce plausible cultural ideas without evidence. The Qloo path resolves explicit cultural seeds against Qloo aggregate affinity data and exposes that evidence separately from product interpretation. This makes cultural grounding testable and regression-friendly.

## Reliability boundaries

- Explicit taste seeds only.
- Maximum three seeds per run.
- Server-side Qloo credential only.
- Official `@qloo/qloo-harness` (>=0.1.26).
- Bounded 8-second command timeout per seed.
- No silent provider fallback.
- Fixture results are visibly marked synthetic and never represented as Qloo output.
- Qloo aggregate affinities are not claims about an individual's identity or future behavior.

## Local setup

Requires Node.js 22.19+.

```bash
npm install
npm install --global @qloo/qloo-harness
qloo setup --qloo
vercel dev
```

Never put the event credential in source control or client-side code.

## Live endpoint

`POST /api/evaluate`

```json
{
  "goal": "Plan a culturally coherent launch night",
  "seeds": ["Afrobeats", "A24", "Japanese streetwear"]
}
```

If `QLOO_API_KEY` is not configured, the endpoint returns HTTP 503 with `configuration_required`.

## License

MIT

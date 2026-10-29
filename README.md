# TasteProof

**Cultural QA / regression testing infrastructure for AI agents, powered by Qloo.**

TasteProof audits an AI agent's proposed recommendation against explicit cultural anchors. The live path uses two canonical Qloo hackathon workflows: `recommend` creates a grounded comparison set from the same anchors, then `rank` places the audited proposal and Qloo-grounded alternatives into one shared comparison context.

If Qloo is removed, TasteProof can collect input but cannot perform its central cultural-grounding test.

## Judge path

1. Enter a scenario, 1–3 explicit named cultural anchors, a Qloo entity type, and the AI recommendation being audited.
2. Run **Live Qloo audit**.
3. Read the Taste Passport: cultural-fit classification, proposal rank, better-grounded alternative, provenance, limitations, run ID, and SHA-256 digest.
4. Expand the evidence record to inspect normalized Qloo workflow responses.

The separate **Illustrative audit** is synthetic and clearly labeled. It demonstrates UX only and never counts as Qloo evidence.

## Why Qloo is structurally necessary

A generic LLM can make a recommendation sound culturally plausible. TasteProof tests whether it holds up against Qloo-grounded alternatives under the same explicit taste signals.

```text
scenario + anchors + agent proposal
        ↓
qloo exec recommend
        ↓
Qloo-grounded comparison candidates
        ↓
qloo exec rank
        ↓
proposal + alternatives ranked together
        ↓
Taste Passport + provenance + digest
```

Scores from separate ranking calls are not treated as comparable. The proposal and alternatives are evaluated together in one `rank` workflow.

## Reliability boundaries

- Explicit named anchors only; no hidden demographic inference.
- Maximum 3 anchors and 6 compared options per run.
- Server-side Qloo credential only.
- Official `@qloo/qloo-harness` `0.1.26` and canonical event-supported `qloo exec` workflows.
- 12-second process timeout per workflow.
- No provider fallback; live Qloo failure fails closed.
- Fixture results are visibly synthetic and never represented as Qloo output.
- Ambiguous or unresolved entities remain visible.
- Qloo aggregate affinities are not claims about one individual's identity or future behavior.

## Local setup

Requires Node.js 22.19+.

```bash
npm install
npm install --global @qloo/qloo-harness@0.1.26
```

Configure server-side only:

```text
QLOO_API_KEY=<event credential>
QLOO_BASE_URL=https://hackathon.api.qloo.com
QLOO_TRUSTED_BASE_URL=https://hackathon.api.qloo.com
```

Then run:

```bash
qloo setup --status
npm test
vercel dev
```

Never put the event credential in source control, browser JavaScript, screenshots, or logs.

## Live endpoint

`POST /api/evaluate`

```json
{
  "scenario": "An AI agent recommends a launch headliner for an audience whose explicit tastes span Afrobeats, independent film, and Japanese fashion.",
  "targetType": "artist",
  "anchors": ["Burna Boy", "A24", "Sacai"],
  "proposal": "Drake"
}
```

When the credential is absent, the endpoint returns HTTP 503 with `configuration_required` and `fallbackUsed: false`.

## Testing

`npm test` covers malformed input, anchor deduplication, cultural-fit classification, proposal-rank mapping, and semantic digest stability. Live Qloo certification is a separate gate and requires a real event credential.

## Limitations

TasteProof produces a relative test against the options in the current run. It does not establish a universal cultural truth, infer sensitive traits, or predict individual behavior. Results depend on Qloo graph coverage and entity resolution.

## License

MIT

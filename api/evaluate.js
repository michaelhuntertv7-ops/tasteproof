const { execFile } = require('node:child_process');
const path = require('node:path');
const crypto = require('node:crypto');

function clean(v, max = 160) {
  return String(v || '').trim().replace(/[\u0000-\u001f]/g, ' ').slice(0, max);
}

function runQloo(args) {
  return new Promise((resolve, reject) => {
    const bin = path.join(process.cwd(), 'node_modules', '.bin', process.platform === 'win32' ? 'qloo.cmd' : 'qloo');
    execFile(bin, args, { timeout: 8000, env: process.env, maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) return reject(new Error(clean(stderr || err.message, 600)));
      try { resolve(JSON.parse(stdout)); }
      catch { reject(new Error('Qloo returned non-JSON output')); }
    });
  });
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  if (!process.env.QLOO_API_KEY) {
    return res.status(503).json({
      status: 'configuration_required',
      mode: 'live_qloo',
      message: 'Live Qloo credential is not configured. TasteProof fails closed and will not substitute fixture evidence.'
    });
  }

  const goal = clean(req.body?.goal, 240);
  const seeds = Array.isArray(req.body?.seeds)
    ? req.body.seeds.map(v => clean(v, 80)).filter(Boolean).slice(0, 3)
    : [];

  if (!goal || !seeds.length) return res.status(400).json({ error: 'Provide a goal and 1-3 explicit cultural seeds.' });

  const startedAt = new Date().toISOString();
  const evidence = [];
  try {
    for (const seed of seeds) {
      const result = await runQloo(['api', 'search', '--query', seed, '--take', '5', '--json']);
      evidence.push({ seed, result });
    }
    const normalized = { goal, seeds, evidence };
    const digest = crypto.createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
    return res.status(200).json({
      status: 'ok',
      mode: 'live_qloo',
      source: 'Qloo API via @qloo/qloo-harness',
      startedAt,
      completedAt: new Date().toISOString(),
      boundaries: { maxSeeds: 3, timeoutMsPerSeed: 8000, fallback: 'none' },
      evidence,
      runDigest: `sha256:${digest}`,
      interpretationNote: 'Qloo results describe aggregate cultural affinities. TasteProof does not treat them as claims about an individual.'
    });
  } catch (error) {
    return res.status(502).json({
      status: 'qloo_failed_closed',
      mode: 'live_qloo',
      message: clean(error.message, 600),
      fallbackUsed: false
    });
  }
};

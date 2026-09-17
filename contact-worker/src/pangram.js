// API contract: https://docs.pangram.com/api-reference/ai-detection.md
const TASK_URL = 'https://text.external-api.pangram.com/task';
const DEADLINE_MS = 20000;
const POLL_MS = 500;

function unavailable() { return new Error('Message screening unavailable'); }

function classification(result) {
  const fractions = [result.fraction_ai, result.fraction_ai_assisted, result.fraction_human];
  const counts = [result.num_ai_segments, result.num_ai_assisted_segments, result.num_human_segments];
  if (fractions.some((value) => typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1)
      || Math.abs(fractions.reduce((sum, value) => sum + value, 0) - 1) > 0.001
      || counts.some((value) => !Number.isSafeInteger(value) || value < 0)
      || counts.every((value) => value === 0)
      || counts.some((value, index) => (value > 0) !== (fractions[index] > 0))
      || !Array.isArray(result.windows)
      || ['text', 'version', 'headline', 'prediction', 'prediction_short'].some((key) => typeof result[key] !== 'string' || !result[key].trim())) {
    throw unavailable();
  }
  // AI-assisted-only writing is not AI-generated under this form's policy.
  return { aiGenerated: result.fraction_ai > 0 };
}

// Dependencies are supplied only by module-level tests, never request fields or
// Worker bindings. Production always uses the fixed Pangram endpoint and deadline.
export function createPangramScreen({
  fetchImpl = (...args) => fetch(...args),
  now = () => Date.now(),
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  deadlineMs = DEADLINE_MS,
} = {}) {
  return async function screen(text, apiKey) {
    if (typeof apiKey !== 'string' || !apiKey.trim()) throw unavailable();
    const deadline = now() + deadlineMs;
    async function json(url, options = {}) {
      const remaining = deadline - now();
      if (remaining <= 0) throw unavailable();
      const controller = new AbortController();
      let timer;
      try {
        return await Promise.race([
          (async () => {
            const response = await fetchImpl(url, {
              ...options,
              headers: { 'x-api-key': apiKey, ...(options.headers || {}) },
              signal: controller.signal,
              redirect: 'error',
            });
            if (!response.ok) throw unavailable();
            const result = await response.json();
            if (!result || typeof result !== 'object' || Array.isArray(result) || now() >= deadline) throw unavailable();
            return result;
          })(),
          new Promise((_, reject) => {
            timer = setTimeout(() => { controller.abort(); reject(unavailable()); }, remaining);
          }),
        ]);
      } finally {
        clearTimeout(timer);
      }
    }
    const task = await json(TASK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, model: 'pangram-4', public_dashboard_link: false }),
    });
    if (typeof task.task_id !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(task.task_id)) throw unavailable();
    while (now() < deadline) {
      const result = await json(`${TASK_URL}/${encodeURIComponent(task.task_id)}`, { method: 'GET' });
      if (result.stage === 'STAGE_SUCCESS') return classification(result);
      if (result.stage === 'STAGE_FAILED' || typeof result.stage !== 'string'
          || !/^STAGE_[A-Z_]+$/.test(result.stage) || result.task_id !== task.task_id) throw unavailable();
      const remaining = deadline - now();
      if (remaining <= 0) throw unavailable();
      await sleep(Math.min(POLL_MS, remaining));
    }
    throw unavailable();
  };
}

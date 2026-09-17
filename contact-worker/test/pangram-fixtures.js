export function result(overrides = {}) {
  return { stage: 'STAGE_SUCCESS', text: 'A test inquiry.', version: '3.0',
    headline: 'Human Written', prediction: 'Human-written', prediction_short: 'Human',
    fraction_ai: 0, fraction_ai_assisted: 0, fraction_human: 1,
    num_ai_segments: 0, num_ai_assisted_segments: 0, num_human_segments: 1,
    windows: [], ...overrides };
}

export function provider(completed = result()) {
  const calls = [];
  return { calls, fetchImpl: async (url, options) => {
    calls.push({ url, options });
    return Response.json(options.method === 'POST' ? { task_id: 'test-task' } : completed);
  } };
}

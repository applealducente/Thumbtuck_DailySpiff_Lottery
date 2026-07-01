const { getState, saveState, setCors } = require('./_state');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    const { token, numbers } = req.body || {};
    const state = await getState();
    const agent = state.agents[token];
    if (!agent) return res.status(404).json({ error: 'Not checked in' });

    if (!Array.isArray(numbers)) return res.status(400).json({ error: 'Numbers must be an array' });
    const unique = [...new Set(numbers)];
    const valid = unique.every(n => Number.isInteger(n) && n >= 1 && n <= 12);
    if (!valid) return res.status(400).json({ error: 'Numbers must be unique integers 1-12' });
    if (unique.length !== agent.sales) {
      return res.status(400).json({ error: `You must pick exactly ${agent.sales} number(s)` });
    }

    agent.numbers = unique.sort((a, b) => a - b);
    await saveState(state);
    res.status(200).json({ agent });
  } catch (e) {
    res.status(500).json({ error: 'Could not save picks', detail: String(e) });
  }
};

const { getState, saveState, setCors } = require('./_state');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    const { token } = req.body || {};
    const state = await getState();
    const agent = state.agents[token];
    if (!agent) return res.status(404).json({ error: 'Not checked in' });

    if (agent.sales < 12) {
      agent.sales += 1;
    }
    await saveState(state);
    res.status(200).json({ agent });
  } catch (e) {
    res.status(500).json({ error: 'Could not log sale', detail: String(e) });
  }
};

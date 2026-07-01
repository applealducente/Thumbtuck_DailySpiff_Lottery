const crypto = require('crypto');
const { getState, saveState, setCors } = require('./_state');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    const { name, token } = req.body || {};
    const state = await getState();

    if (token && state.agents[token]) {
      return res.status(200).json({ token, agent: state.agents[token] });
    }

    const cleanName = (name || '').trim();
    if (!cleanName) return res.status(400).json({ error: 'Name is required' });

    const onRoster = state.masterRoster.some(r => r.name.toLowerCase() === cleanName.toLowerCase());
    if (!onRoster) {
      return res.status(400).json({ error: 'That name is not on the roster yet — ask admin to add you.' });
    }

    // Reuse an existing ticket for this name if one already exists today,
    // so switching between agents on a shared device doesn't wipe anyone's picks.
    const existingEntry = Object.entries(state.agents).find(
      ([, a]) => a.name.toLowerCase() === cleanName.toLowerCase()
    );
    if (existingEntry) {
      const [existingToken, existingAgent] = existingEntry;
      return res.status(200).json({ token: existingToken, agent: existingAgent });
    }

    const newToken = crypto.randomUUID();
    const agent = { id: newToken, name: cleanName, sales: 0, numbers: [] };
    state.agents[newToken] = agent;
    await saveState(state);

    res.status(200).json({ token: newToken, agent });
  } catch (e) {
    res.status(500).json({ error: 'Check-in failed', detail: String(e) });
  }
};

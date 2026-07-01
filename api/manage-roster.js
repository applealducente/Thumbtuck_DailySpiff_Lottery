const crypto = require('crypto');
const { getState, saveState, setCors } = require('./_state');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    const { password, action, name, id } = req.body || {};
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Wrong password' });
    }

    const state = await getState();

    if (action === 'add') {
      const cleanName = (name || '').trim();
      if (!cleanName) return res.status(400).json({ error: 'Name is required' });
      const exists = state.masterRoster.some(r => r.name.toLowerCase() === cleanName.toLowerCase());
      if (exists) return res.status(400).json({ error: 'That name is already on the roster' });
      state.masterRoster.push({ id: crypto.randomUUID(), name: cleanName });
    } else if (action === 'remove') {
      if (!id) return res.status(400).json({ error: 'id is required' });
      state.masterRoster = state.masterRoster.filter(r => r.id !== id);
    } else {
      return res.status(400).json({ error: 'action must be "add" or "remove"' });
    }

    await saveState(state);
    res.status(200).json({ masterRoster: state.masterRoster });
  } catch (e) {
    res.status(500).json({ error: 'Roster update failed', detail: String(e) });
  }
};

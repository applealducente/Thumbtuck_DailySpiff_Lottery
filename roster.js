const { getState, setCors } = require('./_state');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });

  try {
    const state = await getState();
    const names = state.masterRoster
      .map(r => ({ id: r.id, name: r.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
    res.status(200).json({ names });
  } catch (e) {
    res.status(500).json({ error: 'Could not load roster', detail: String(e) });
  }
};

const { getState, publicState, setCors } = require('./_state');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });

  try {
    const state = await getState();
    res.status(200).json(publicState(state));
  } catch (e) {
    res.status(500).json({ error: 'Could not load state', detail: String(e) });
  }
};

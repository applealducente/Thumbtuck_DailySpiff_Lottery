const { getState, setCors } = require('./_state');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });

  try {
    const { token } = req.query;
    const state = await getState();
    const agent = state.agents[token];
    if (!agent) return res.status(404).json({ error: 'Not found' });
    res.status(200).json({ agent, dayIndex: state.dayIndex, drawnToday: state.drawnToday });
  } catch (e) {
    res.status(500).json({ error: 'Could not load ticket', detail: String(e) });
  }
};

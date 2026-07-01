const { saveState, publicState, setCors } = require('./_state');

const FRESH_STATE = {
  dayIndex: 1,
  pot: 50,
  drawnToday: false,
  winningNumbers: [],
  dayWinners: [],
  masterRoster: [],
  agents: {},
  history: []
};

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    const { password } = req.body || {};
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Wrong password' });
    }

    const state = JSON.parse(JSON.stringify(FRESH_STATE));
    await saveState(state);
    res.status(200).json(publicState(state));
  } catch (e) {
    res.status(500).json({ error: 'Reset failed', detail: String(e) });
  }
};

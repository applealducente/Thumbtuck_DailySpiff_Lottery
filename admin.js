const { getState, setCors } = require('./_state');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    const { password } = req.body || {};
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Wrong password' });
    }

    const state = await getState();
    const agents = Object.values(state.agents).map(a => ({
      name: a.name,
      sales: a.sales,
      numbers: a.numbers
    }));

    res.status(200).json({
      dayIndex: state.dayIndex,
      pot: state.pot,
      drawnToday: state.drawnToday,
      winningNumbers: state.winningNumbers,
      history: state.history,
      agents
    });
  } catch (e) {
    res.status(500).json({ error: 'Admin load failed', detail: String(e) });
  }
};

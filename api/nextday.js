const { getState, saveState, publicState, setCors } = require('./_state');

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

    if (state.drawnToday) {
      const won = state.dayWinners && state.dayWinners.length > 0;
      state.pot = won ? 50 : state.pot + 50; // no cap, accumulates until won
    }

    state.dayIndex += 1;
    state.drawnToday = false;
    state.winningNumbers = [];
    state.dayWinners = [];
    Object.values(state.agents).forEach(a => {
      a.sales = 0;
      a.numbers = [];
    });

    await saveState(state);
    res.status(200).json(publicState(state));
  } catch (e) {
    res.status(500).json({ error: 'Could not advance day', detail: String(e) });
  }
};

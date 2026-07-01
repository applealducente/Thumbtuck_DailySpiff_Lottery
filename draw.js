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
      return res.status(200).json(publicState(state));
    }

    const pool = Array.from({ length: 12 }, (_, i) => i + 1);
    const drawn = [];
    while (drawn.length < 4) {
      const idx = Math.floor(Math.random() * pool.length);
      drawn.push(pool.splice(idx, 1)[0]);
    }

    const winners = Object.values(state.agents).filter(a =>
      a.sales >= 4 &&
      a.numbers.length === a.sales &&
      drawn.every(n => a.numbers.includes(n))
    );

    let payoutEach = 0;
    if (winners.length) {
      payoutEach = Math.round((state.pot / winners.length) * 100) / 100;
    }

    state.winningNumbers = drawn;
    state.drawnToday = true;
    state.dayWinners = winners.map(w => ({ name: w.name, payout: payoutEach }));
    state.history.push({
      dayIndex: state.dayIndex,
      pot: state.pot,
      winningNumbers: drawn,
      winners: state.dayWinners
    });

    await saveState(state);
    res.status(200).json(publicState(state));
  } catch (e) {
    res.status(500).json({ error: 'Draw failed', detail: String(e) });
  }
};

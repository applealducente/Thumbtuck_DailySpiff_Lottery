const { getState, saveState, publicState, setCors } = require('./_state');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    const { password, pot } = req.body || {};
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Wrong password' });
    }

    const amount = Number(pot);
    if (!Number.isFinite(amount) || amount < 0) {
      return res.status(400).json({ error: 'Pot must be a positive number' });
    }

    const state = await getState();
    state.pot = Math.round(amount * 100) / 100;
    await saveState(state);

    res.status(200).json(publicState(state));
  } catch (e) {
    res.status(500).json({ error: 'Could not update pot', detail: String(e) });
  }
};

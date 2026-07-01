const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});
const STATE_KEY = 'spiff:state';

const DEFAULT_STATE = {
  dayIndex: 1,
  pot: 50,
  drawnToday: false,
  winningNumbers: [],
  dayWinners: [],
  masterRoster: [], // [{ id, name }] — names admin has added, agents pick from this list
  agents: {},   // token -> { id, name, sales, numbers: [] }
  history: []   // { dayIndex, pot, winningNumbers, winners: [{name, payout}] }
};

async function getState() {
  const raw = await redis.get(STATE_KEY);
  if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STATE));
  const state = typeof raw === 'string' ? JSON.parse(raw) : raw;
  if (!state.masterRoster) state.masterRoster = [];
  if (!state.agents) state.agents = {};
  if (!state.history) state.history = [];
  return state;
}

async function saveState(state) {
  await redis.set(STATE_KEY, JSON.stringify(state));
}

function publicAgentList(state) {
  return Object.values(state.agents).map(a => ({
    id: a.id,
    name: a.name,
    sales: a.sales,
    hasPicked: a.numbers.length === a.sales && a.sales > 0
  }));
}

function publicState(state) {
  return {
    dayIndex: state.dayIndex,
    pot: state.pot,
    drawnToday: state.drawnToday,
    winningNumbers: state.winningNumbers,
    dayWinners: state.dayWinners,
    roster: publicAgentList(state)
  };
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = { redis, getState, saveState, publicState, publicAgentList, setCors };

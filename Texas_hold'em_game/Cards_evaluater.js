// 牌型评估器
const HAND_CATEGORY_NAME = {
  8: "同花顺",
  7: "四条",
  6: "葫芦",
  5: "同花",
  4: "顺子",
  3: "三条",
  2: "两对",
  1: "一对",
  0: "高牌",
};

function evaluate5cards(cards5) {
  const ranks = cards5.map(c => RANK_VALUE[c.rank]).sort((a, b) => b - a);
  const suits = cards5.map(c => c.suit);
  const counts = {};
  ranks.forEach(v => { counts[v] = (counts[v] || 0) + 1; });

  const countRank = Object.entries(counts)
    .map(([v, c]) => [parseInt(v), c])
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return b[0] - a[0];
    });

  const isFlush = new Set(suits).size === 1;
  const uniqueRanks = [...new Set(ranks)].sort((a, b) => b - a);
  let isStraight = false;
  let highCard = Math.max(...uniqueRanks);

  if (uniqueRanks.length === 5 && uniqueRanks[0] - uniqueRanks[4] === 4) {
    isStraight = true;
    highCard = uniqueRanks[0];
  }
  const setRanks = new Set(uniqueRanks);
  if (setRanks.size === 5 &&
    setRanks.has(14) &&
    setRanks.has(5) &&
    setRanks.has(4) &&
    setRanks.has(3) &&
    setRanks.has(2)) {
    isStraight = true;
    highCard = 5;
  }

  if (isStraight && isFlush) {
    return [8, [highCard]];
  }
  if (countRank[0][1] === 4) {
    const four = countRank[0][0];
    const kicker = ranks.find(v => v !== four);
    return [7, [four, kicker]];
  }
  if (countRank[0][1] === 3 && countRank[1][1] === 2) {
    const three = countRank[0][0];
    const pair = countRank[1][0];
    return [6, [three, pair]];
  }
  if (isFlush) {
    return [5, [...ranks].sort((a, b) => b - a)];
  }
  if (isStraight) {
    return [4, [highCard]];
  }
  if (countRank[0][1] === 3) {
    const three = countRank[0][0];
    const kickers = [...new Set(ranks.filter(v => v !== three))].sort((a, b) => b - a);
    return [3, [three, ...kickers]];
  }
  if (countRank[0][1] === 2 && countRank[1][1] === 2) {
    const highPair = Math.max(countRank[0][0], countRank[1][0]);
    const lowPair = Math.min(countRank[0][0], countRank[1][0]);
    const kicker = ranks.find(v => v !== highPair && v !== lowPair);
    return [2, [highPair, lowPair, kicker]];
  }
  if (countRank[0][1] === 2) {
    const pair = countRank[0][0];
    const kickers = [...new Set(ranks.filter(v => v !== pair))].sort((a, b) => b - a);
    return [1, [pair, ...kickers]];
  }
  return [0, [...ranks].sort((a, b) => b - a)];
}

function compareHands(h1, h2) {
  if (h1[0] !== h2[0]) return h1[0] - h2[0];
  const a = h1[1];
  const b = h2[1];
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const va = a[i] || 0;
    const vb = b[i] || 0;
    if (va !== vb) return va - vb;
  }
  return 0;
}

function evaluate7cards(cards7) {
  let best = null;
  const n = cards7.length;
  for (let a = 0; a < n; a++) {
    for (let b = a + 1; b < n; b++) {
      for (let c = b + 1; c < n; c++) {
        for (let d = c + 1; d < n; d++) {
          for (let e = d + 1; e < n; e++) {
            const comb = [cards7[a], cards7[b], cards7[c], cards7[d], cards7[e]];
            const val = evaluate5cards(comb);
            if (!best || compareHands(val, best) > 0) {
              best = val;
            }
          }
        }
      }
    }
  }
  return best;
}

if (typeof module !== 'undefined') {
  module.exports = { HAND_CATEGORY_NAME, evaluate5cards, compareHands, evaluate7cards };
}
// 牌组定义与操作
const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const RANK_VALUE = {};
RANKS.forEach((r, i) => { RANK_VALUE[r] = i + 2; });

function createDeck() {
  const deck = [];
  for (const s of SUITS) {
    for (const r of RANKS) {
      deck.push({rank: r, suit: s});
    }
  }
  return deck;
}

function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function cardStr(card) {
  return card.rank + card.suit;
}

// 导出到全局（简单方案）或模块化导出
if (typeof module !== 'undefined') {
  module.exports = { SUITS, RANKS, RANK_VALUE, createDeck, shuffle, cardStr };
}
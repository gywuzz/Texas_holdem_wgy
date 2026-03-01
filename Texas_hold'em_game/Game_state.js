// 游戏常量与状态管理
const NUM_PLAYERS = 4;
const SMALL_BLIND = 10;
const BIG_BLIND = 20;

const streetNames = {
  "preflop": "Preflop",
  "flop": "Flop",
  "turn": "Turn",
  "river": "River",
  "end": "结束",
};

// 游戏状态对象
const GameState = {
  deck: [],
  playersCards: [],
  communityCards: [],
  chips: new Array(NUM_PLAYERS).fill(1000),
  inHand: new Array(NUM_PLAYERS).fill(true),
  bets: new Array(NUM_PLAYERS).fill(0),
  totalBets: new Array(NUM_PLAYERS).fill(0),
  pot: 0,
  currentBet: 0,
  dealerIndex: -1,
  street: "preflop",
  handActive: false,
  revealAll: false,

  reset() {
    this.deck = createDeck();
    shuffle(this.deck);
    this.playersCards = Array.from({length: NUM_PLAYERS}, () => []);
    this.communityCards = [];
    this.bets = new Array(NUM_PLAYERS).fill(0);
    this.totalBets = new Array(NUM_PLAYERS).fill(0);
    this.pot = 0;
    this.currentBet = 0;
    this.street = "preflop";
    this.handActive = true;
    this.revealAll = false;
    this.inHand = this.chips.map((c, i) => i === 0 ? true : c > 0);
  },

  dealHoleCards() {
    for (let r = 0; r < 2; r++) {
      for (let i = 0; i < NUM_PLAYERS; i++) {
        if (this.inHand[i]) {
          this.playersCards[i].push(this.deck.pop());
        }
      }
    }
  },

  takeBet(player, amount) {
    if (!this.inHand[player] || amount <= 0) return;
    const actual = player === 0 ? amount : Math.min(amount, this.chips[player]);
    if (player !== 0 && actual <= 0) return;
    this.chips[player] -= actual;
    this.bets[player] += actual;
    this.totalBets[player] += actual;
    this.pot += actual;
  },

  advanceStreet() {
    this.bets = new Array(NUM_PLAYERS).fill(0);
    this.currentBet = 0;

    if (this.street === "preflop") {
      this.street = "flop";
      while (this.communityCards.length < 3) {
        this.communityCards.push(this.deck.pop());
      }
    } else if (this.street === "flop") {
      this.street = "turn";
      if (this.communityCards.length < 4) {
        this.communityCards.push(this.deck.pop());
      }
    } else if (this.street === "turn") {
      this.street = "river";
      if (this.communityCards.length < 5) {
        this.communityCards.push(this.deck.pop());
      }
    }
  },

  revealRemaining() {
    while (this.communityCards.length < 5 && this.deck.length > 0) {
      this.communityCards.push(this.deck.pop());
    }
  }
};

if (typeof module !== 'undefined') {
  module.exports = { NUM_PLAYERS, SMALL_BLIND, BIG_BLIND, streetNames, GameState };
}
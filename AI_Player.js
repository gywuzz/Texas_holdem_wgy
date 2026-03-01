// AI玩家决策
function estimateWinProbability(idx, numOpponents, numSimulations = 500) {
  const heroHole = GameState.playersCards[idx];
  const board = GameState.communityCards;
  const known = [...heroHole, ...board];
  const fullDeck = createDeck();
  const remaining = fullDeck.filter(c =>
    !known.some(k => k.rank === c.rank && k.suit === c.suit)
  );
  const neededCommunity = 5 - board.length;
  const cardsPerOpponent = 2;
  const neededTotal = neededCommunity + numOpponents * cardsPerOpponent;
  if (neededTotal <= 0 || neededTotal > remaining.length) return 0.0;

  let wins = 0;
  let ties = 0;
  for (let sim = 0; sim < numSimulations; sim++) {
    const sample = [];
    const tempDeck = [...remaining];
    for (let i = 0; i < neededTotal; i++) {
      const j = Math.floor(Math.random() * tempDeck.length);
      sample.push(tempDeck[j]);
      tempDeck.splice(j, 1);
    }
    let pos = 0;
    let futureBoard = [...board];
    if (neededCommunity > 0) {
      futureBoard = board.concat(sample.slice(pos, pos + neededCommunity));
      pos += neededCommunity;
    }
    const oppHands = [];
    for (let o = 0; o < numOpponents; o++) {
      oppHands.push(sample.slice(pos, pos + 2));
      pos += 2;
    }
    const heroBest = evaluate7cards(heroHole.concat(futureBoard));
    const oppBestList = oppHands.map(h => evaluate7cards(h.concat(futureBoard)));
    let bestOpp = oppBestList[0];
    for (let i = 1; i < oppBestList.length; i++) {
      if (compareHands(oppBestList[i], bestOpp) > 0) {
        bestOpp = oppBestList[i];
      }
    }
    const cmp = compareHands(heroBest, bestOpp);
    if (cmp > 0) wins += 1;
    else if (cmp === 0) ties += 1;
  }
  return (wins + 0.5 * ties) / numSimulations;
}

function aiAction(idx) {
  if (!GameState.inHand[idx] || GameState.chips[idx] <= 0) return;
  const toCall = GameState.currentBet - GameState.bets[idx];
  const opponents = GameState.inHand.filter((v, i) => v && i !== idx).length;
  const statusElem = playerElements(idx).status;

  if (opponents <= 0) {
    if (toCall > 0) {
      GameState.takeBet(idx, toCall);
      statusElem.textContent = "状态：跟注（无对手）";
    } else {
      statusElem.textContent = "状态：过牌";
    }
    return;
  }

  const winProb = estimateWinProbability(idx, opponents, 80);

  if (toCall <= 0) {
    if (winProb > 0.7 && GameState.chips[idx] > 0) {
      const baseBet = Math.max(BIG_BLIND, Math.floor(GameState.pot * 0.5));
      const betAmount = Math.min(baseBet, GameState.chips[idx]);
      if (betAmount > 0) {
        statusElem.textContent = `状态：主动下注 ${betAmount}（胜率 ${winProb.toFixed(2)}）`;
        GameState.takeBet(idx, betAmount);
        GameState.currentBet = GameState.bets[idx];
      } else {
        statusElem.textContent = `状态：过牌（胜率 ${winProb.toFixed(2)}）`;
      }
    } else if (winProb > 0.45) {
      statusElem.textContent = `状态：过牌（胜率 ${winProb.toFixed(2)}）`;
    } else {
      statusElem.textContent = `状态：过牌（弱牌，胜率 ${winProb.toFixed(2)}）`;
    }
  } else {
    const potAfterCall = GameState.pot + toCall;
    const potOdds = potAfterCall > 0 ? (toCall / potAfterCall) : 1.0;
    if (winProb < potOdds * 0.8) {
      GameState.inHand[idx] = false;
      statusElem.textContent = `状态：弃牌（胜率 ${winProb.toFixed(2)} < 彩池赔率 ${potOdds.toFixed(2)}）`;
      return;
    }
    GameState.takeBet(idx, toCall);
    const canRaise = GameState.chips[idx] > BIG_BLIND;
    if (winProb > potOdds * 1.5 && canRaise) {
      const extra = Math.min(
        Math.max(BIG_BLIND, Math.floor(GameState.pot * 0.3)),
        GameState.chips[idx]
      );
      if (extra > 0) {
        GameState.takeBet(idx, extra);
        GameState.currentBet = GameState.bets[idx];
        statusElem.textContent = `状态：跟注并加注 ${extra}（胜率 ${winProb.toFixed(2)}）`;
      } else {
        statusElem.textContent = `状态：跟注（胜率 ${winProb.toFixed(2)}）`;
      }
    } else {
      statusElem.textContent = `状态：跟注（胜率 ${winProb.toFixed(2)}，不适合加注）`;
    }
  }
}

if (typeof module !== 'undefined') {
  module.exports = { estimateWinProbability, aiAction };
}
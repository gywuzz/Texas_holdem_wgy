// 用户操作处理
function postBlinds() {
  const sb = (GameState.dealerIndex + 1) % NUM_PLAYERS;
  const bb = (GameState.dealerIndex + 2) % NUM_PLAYERS;

  for (let i = 0; i < NUM_PLAYERS; i++) {
    const elems = playerElements(i);
    if (GameState.inHand[i]) {
      elems.status.textContent = "状态：在局中";
    } else {
      elems.status.textContent = "状态：筹码耗尽";
    }
    elems.handType.textContent = "牌型：-";
    elems.handType.classList.remove('winner');
  }

  GameState.takeBet(sb, SMALL_BLIND);
  playerElements(sb).status.textContent = "状态：小盲注";

  GameState.takeBet(bb, BIG_BLIND);
  playerElements(bb).status.textContent = "状态：大盲注";

  GameState.currentBet = BIG_BLIND;
}

function newRound() {
  if (GameState.handActive) return;
  GameState.dealerIndex = (GameState.dealerIndex + 1) % NUM_PLAYERS;
  GameState.reset();
  GameState.dealHoleCards();
  renderCommunity();
  renderPlayers();
  postBlinds();
  renderPlayers();
  enableActionButtons(true);
  qs('#newRoundBtn').disabled = true;
  setStatusBar("新局开始：Preflop，轮到你操作。");
}

function awardPot(winners) {
  if (!winners || winners.length === 0 || GameState.pot <= 0) return;
  const share = Math.floor(GameState.pot / winners.length);
  winners.forEach(w => { GameState.chips[w] += share; });
  GameState.pot = 0;
  qs('#potLabel').textContent = `底池：${GameState.pot}`;
  renderPlayers();
}

function endHand() {
  GameState.handActive = false;
  enableActionButtons(false);
  qs('#newRoundBtn').disabled = false;
  GameState.street = "end";
  qs('#streetLabel').textContent = `阶段：${streetNames["end"]}`;
}

function doShowdown() {
  GameState.revealAll = true;
  renderCommunity();
  renderPlayers();

  const bestValues = [];
  const alive = [];
  for (let i = 0; i < NUM_PLAYERS; i++) {
    if (GameState.inHand[i] && GameState.playersCards[i].length === 2) {
      const val = evaluate7cards([...GameState.playersCards[i], ...GameState.communityCards]);
      bestValues.push(val);
      alive.push(i);
    }
  }

  if (alive.length === 0) {
    setStatusBar("无人获胜，底池作废。");
    endHand();
    return;
  }

  let maxVal = bestValues[0];
  let winners = [alive[0]];
  for (let k = 1; k < alive.length; k++) {
    const cmp = compareHands(bestValues[k], maxVal);
    if (cmp > 0) {
      maxVal = bestValues[k];
      winners = [alive[k]];
    } else if (cmp === 0) {
      winners.push(alive[k]);
    }
  }

  awardPot(winners);

  for (let idx = 0; idx < alive.length; idx++) {
    const pIndex = alive[idx];
    const v = bestValues[idx];
    const elems = playerElements(pIndex);
    const category = v[0];
    let extra = "";
    if (winners.includes(pIndex)) {
      extra = winners.length === 1 ? "  ← 胜者!" : "  ← 平局";
      elems.handType.classList.add('winner');
    }
    elems.handType.textContent = `牌型：${HAND_CATEGORY_NAME[category] || "未知"}${extra}`;
  }

  const winnerText = winners.length === 1 
    ? `${winners[0] === 0 ? "你" : `玩家 ${winners[0] + 1}`} 以 ${HAND_CATEGORY_NAME[maxVal[0]]} 获胜`
    : `${winners.map(w => w === 0 ? "你" : `玩家 ${w + 1}`).join("，")} 以 ${HAND_CATEGORY_NAME[maxVal[0]]} 平分底池`;
  
  setStatusBar(`摊牌结果：${winnerText}。`);
  endHand();
}

function actionCallOrCheck() {
  if (!GameState.handActive || !GameState.inHand[0]) return;
  const toCall = GameState.currentBet - GameState.bets[0];
  const statusElem = playerElements(0).status;
  
  if (toCall <= 0) {
    statusElem.textContent = "状态：过牌";
  } else {
    statusElem.textContent = `状态：跟注 ${toCall}`;
    GameState.takeBet(0, toCall);
  }
  renderPlayers();
  afterPlayerAction();
}

function actionRaise() {
  if (!GameState.handActive || !GameState.inHand[0]) return;
  const raiseAmount = 20;
  const targetBet = GameState.currentBet + raiseAmount;
  const toPay = targetBet - GameState.bets[0];
  if (toPay <= 0) return;
  
  playerElements(0).status.textContent = "状态：加注";
  GameState.currentBet = targetBet;
  GameState.takeBet(0, toPay);
  renderPlayers();
  afterPlayerAction();
}

function actionFold() {
  if (!GameState.handActive || !GameState.inHand[0]) return;
  GameState.inHand[0] = false;
  playerElements(0).status.textContent = "状态：弃牌";
  enableActionButtons(false);
  GameState.revealRemaining();
  renderCommunity();
  doShowdown();
}

function afterPlayerAction() {
  for (let i = 1; i < NUM_PLAYERS; i++) {
    if (!GameState.inHand[i] || GameState.chips[i] <= 0) continue;
    aiAction(i);
  }

  const alive = GameState.inHand.map((v, i) => v ? i : -1).filter(i => i >= 0);

  if (alive.length === 1) {
    awardPot([alive[0]]);
    const who = alive[0] === 0 ? "你" : `玩家${alive[0] + 1}`;
    setStatusBar(`所有人弃牌，${who} 直接赢得底池。`);
    endHand();
    return;
  }

  const toCallNow = GameState.currentBet - GameState.bets[0];

  if (GameState.inHand[0] && toCallNow > 0) {
    qs('#btnCall').textContent = `跟注 ${toCallNow}`;
    enableActionButtons(true);
    setStatusBar(`有玩家加注，需跟注 ${toCallNow}，请选择操作。`);
    return;
  }

  if (GameState.street === "river") {
    GameState.revealRemaining();
    renderCommunity();
    doShowdown();
    return;
  }

  GameState.advanceStreet();
  renderCommunity();
  renderPlayers();
  qs('#btnCall').textContent = `看牌`;
  enableActionButtons(true);
  setStatusBar(`${streetNames[GameState.street]} 阶段，轮到你操作。`);
}

if (typeof module !== 'undefined') {
  module.exports = { newRound, actionCallOrCheck, actionRaise, actionFold, afterPlayerAction, doShowdown };
}
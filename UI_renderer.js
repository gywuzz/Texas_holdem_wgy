// UI渲染函数
function qs(selector) { return document.querySelector(selector); }

function playerElements(i) {
  const root = document.querySelector(`.player[data-player-index="${i}"]`);
  return {
    root,
    title: root.querySelector('[data-role="title"]'),
    cards: root.querySelector('[data-role="cards"]'),
    chips: root.querySelector('[data-role="chips"]'),
    bet: root.querySelector('[data-role="bet"]'),
    status: root.querySelector('[data-role="status"]'),
    handType: root.querySelector('[data-role="handType"]'),
  };
}

function renderCommunity() {
  const board = qs('#communityCards');
  board.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    const div = document.createElement('div');
    div.className = 'card';
    if (i < GameState.communityCards.length) {
      div.textContent = cardStr(GameState.communityCards[i]);
    } else {
      div.textContent = "🂠";
    }
    board.appendChild(div);
  }
}

function renderPlayers() {
  for (let i = 0; i < NUM_PLAYERS; i++) {
    const elems = playerElements(i);
    let titleText = i === 0 ? "玩家 1（Me）" : `玩家 ${i + 1}`;
    if (i === GameState.dealerIndex) titleText += " (庄)";
    elems.title.textContent = titleText;

    elems.cards.innerHTML = "";
    const showCards = (i === 0) || GameState.revealAll;
    if (GameState.inHand[i] && GameState.playersCards[i].length === 2) {
      for (let j = 0; j < 2; j++) {
        const div = document.createElement('div');
        div.className = 'card';
        div.textContent = showCards ? cardStr(GameState.playersCards[i][j]) : "🂠";
        elems.cards.appendChild(div);
      }
    } else {
      for (let j = 0; j < 2; j++) {
        const div = document.createElement('div');
        div.className = 'card';
        div.textContent = "🂠";
        elems.cards.appendChild(div);
      }
    }

    elems.chips.textContent = `筹码：${GameState.chips[i]}`;
    elems.bet.textContent = `本局累计下注：${GameState.totalBets[i]}`;
  }
  qs('#potLabel').textContent = `底池：${GameState.pot}`;
  qs('#streetLabel').textContent = `阶段：${streetNames[GameState.street] || "-"}`;
}

function setStatusBar(text) {
  qs('#statusBar').textContent = text;
}

function enableActionButtons(enable) {
  ['#btnCall', '#btnRaise', '#btnFold'].forEach(id => {
    qs(id).disabled = !enable;
  });
}

function initEmptyUI() {
  GameState.communityCards = [];
  renderCommunity();
  renderPlayers();
  enableActionButtons(false);
}

if (typeof module !== 'undefined') {
  module.exports = { qs, playerElements, renderCommunity, renderPlayers, setStatusBar, enableActionButtons, initEmptyUI };
}
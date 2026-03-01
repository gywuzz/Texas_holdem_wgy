// 主程序入口 - 事件绑定与初始化
document.addEventListener('DOMContentLoaded', () => {
  // 绑定按钮事件
  qs('#newRoundBtn').addEventListener('click', newRound);
  qs('#btnCall').addEventListener('click', actionCallOrCheck);
  qs('#btnRaise').addEventListener('click', actionRaise);
  qs('#btnFold').addEventListener('click', actionFold);
  
  // 初始化空UI
  initEmptyUI();
});
// LeakBase 정적 와이어프레임: 현재는 페이지 이동과 화면 상태 미리보기만 연결합니다.
document.addEventListener("DOMContentLoaded", () => {
  const stateButtons = document.querySelectorAll("[data-show-state]");
  const statePanels = document.querySelectorAll("[data-state-panel]");

  stateButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const requestedState = button.dataset.showState;
      statePanels.forEach((panel) => {
        panel.hidden = panel.dataset.statePanel !== requestedState;
      });
      stateButtons.forEach((item) => {
        item.setAttribute("aria-pressed", String(item === button));
      });
    });
  });

  console.log("LeakBase 와이어프레임이 정상적으로 연결되었습니다.");
});

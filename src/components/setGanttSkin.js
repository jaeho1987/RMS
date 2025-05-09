// setGanttSkin.js
export function setGanttSkin(theme) {
  // theme: "light" | "dark"
  let cssFile = "dhtmlxgantt_terrace.css";
  if (theme === "dark") {
    cssFile = "dhtmlxgantt_contrast_black.css";
  }

  const oldLink = document.getElementById("gantt-skin");
  if (oldLink) oldLink.remove();

  const link = document.createElement("link");
  link.id = "gantt-skin";
  link.rel = "stylesheet";
  link.href = `/dhtmlx/gantt/codebase/skins/${cssFile}?v=${Date.now()}`;
  link.onload = () => {
    // 스킨 로드 후 gantt.render()
    if (window.gantt?.render) {
      window.gantt.render();
    }
  };
  document.head.appendChild(link);
}

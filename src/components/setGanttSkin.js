export function setGanttSkin(theme) {
  const skin = theme === 'dark' ? 'dark' : 'meadow'

  // 스킨 설정
  if (window.gantt?.setSkin) {
    window.gantt.setSkin(skin)
  } else if (window.gantt) {
    window.gantt.skin = skin
  }

  // 추가: 다크모드일 때 일부 색상 수정
  const root = document.documentElement
  if (theme === 'dark') {
    root.style.setProperty('--dhx-gantt-base-colors-background', '#2D3039')
    root.style.setProperty('--dhx-gantt-grid-scale-background', '#3F4350')
    root.style.setProperty('--dhx-gantt-grid-scale-color', '#FFFFFA')
    root.style.setProperty('--dhx-gantt-base-colors-border', '#6C6F75')
    root.style.setProperty('--dhx-gantt-base-colors-select', '#3C414D')
    root.style.setProperty('--dhx-gantt-base-colors-hover-color', '#3C414D')
  } else {
    root.style.removeProperty('--dhx-gantt-base-colors-background')
    root.style.setProperty('--dhx-gantt-grid-scale-background', '#F7F7F7')
    root.style.removeProperty('--dhx-gantt-grid-scale-color')
    root.style.setProperty('--dhx-gantt-base-colors-border', '#E5E5E5')
    root.style.removeProperty('--dhx-gantt-base-colors-select')
    root.style.removeProperty('--dhx-gantt-base-colors-hover-color')
  }

  // 렌더링 반영
  window.gantt?.render()
}

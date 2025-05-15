import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react'
import PropTypes from 'prop-types'
import { setGanttSkin } from './setGanttSkin'

const DhtmlxTreeGrid = forwardRef(({
                                     data = [],
                                     columns = [],
                                     onAfterTaskAdd,
                                     onAfterTaskUpdate,
                                     onBeforeTaskDelete,
                                     onClickDelete,
                                     onSaveOrder,
                                     onRowClick,
                                     onRowDblClick,
                                     dragMove = true,
                                     orderBranch = true,
                                     orderBranchFree = false,
                                     style = { width: '100%', height: '600px' },
                                   }, ref) => {
  const ganttContainerRef = useRef(null)
  const initializedRef = useRef(false)
  const eventIDsRef = useRef([])

  useEffect(() => {
    if (!window.gantt || initializedRef.current) return
    initializedRef.current = true

    const gantt = window.gantt

    gantt.config.editable = true
    gantt.config.edit_on_dblclick = true
    gantt.config.details_on_dblclick = false
    gantt.config.select_task = true
    gantt.config.show_chart = false
    gantt.config.drag_move = dragMove
    gantt.config.order_branch = orderBranch
    gantt.config.order_branch_free = orderBranchFree

    gantt.config.columns = [...columns]  // ❌ 자동 삭제 컬럼 추가 제거

    setGanttSkin(getCoreUITheme())

    // 이벤트 등록
    eventIDsRef.current.push(
      gantt.attachEvent('onTaskClick', (id, e) => {
        const target = e.target || e.srcElement
        const cls = target.className || ''

        if (cls.includes('delete-icon')) {
          onClickDelete?.(id)
          return true
        }

        const inlineAPI = gantt.ext?.inlineEditors
        if (inlineAPI?.isVisible()) inlineAPI.save()

        gantt.selectTask(id)
        onRowClick?.(id, e)
        return true
      })
    )

    eventIDsRef.current.push(
      gantt.attachEvent('onTaskDblClick', (id, e) => {
        onRowDblClick?.(id, e)
        return false
      })
    )

    eventIDsRef.current.push(
      gantt.attachEvent('onAfterTaskAdd', (id, item) => {
        onAfterTaskAdd?.(id, item)
      })
    )

    eventIDsRef.current.push(
      gantt.attachEvent('onAfterTaskUpdate', (id, item) => {
        onAfterTaskUpdate?.(id, item)
      })
    )

    eventIDsRef.current.push(
      gantt.attachEvent('onBeforeTaskDelete', (id, item) => {
        return onBeforeTaskDelete?.(id, item) !== false
      })
    )

    eventIDsRef.current.push(
      gantt.attachEvent('onAfterTaskMove', () => {
        const rawList = []
        gantt.eachTask(task => {
          rawList.push({
            id: task.id,
            index: gantt.getTaskIndex(task.id),
            parent: task.parent
          })
        })
        onSaveOrder?.(rawList)
      })
    )

    gantt.init(ganttContainerRef.current)

    return () => {
      eventIDsRef.current.forEach(id => gantt.detachEvent(id))
      eventIDsRef.current = []
      gantt.clearAll?.()
      initializedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!window.gantt) return
    const safeData = data.map(task => ({
      ...task,
      start_date: task.start_date || '2025-01-01',
      duration: task.duration || 1
    }))
    window.gantt.clearAll()
    window.gantt.parse({ data: safeData, links: [] })
  }, [data])

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setGanttSkin(getCoreUITheme())
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-coreui-theme']
    })
    return () => observer.disconnect()
  }, [])

  useImperativeHandle(ref, () => ({
    addNewItem() {
      const selectedId = window.gantt.getSelectedId() || 0
      const newId = window.gantt.uid()
      window.gantt.addTask({
        id: newId,
        parent: selectedId,
        text: '새 항목',
        start_date: '2025-01-01',
        duration: 1,
        open: true
      }, selectedId)
      window.gantt.open(selectedId)
    },
    deleteTask(id) {
      window.gantt.deleteTask(id)
    },
    changeTaskId(oldId, newId) {
      window.gantt.changeTaskId(oldId, newId)
    },
    getTask(id) {
      return window.gantt.getTask(id)
    },
    hasChild(id) {
      return window.gantt.hasChild(id)
    },
    refreshTask(id) {
      return window.gantt.refreshTask(id)
    }
  }))

  function getCoreUITheme() {
    return document.documentElement.getAttribute('data-coreui-theme') || 'light'
  }

  return (
    <div style={{ ...style, position: 'relative' }}>
      <div ref={ganttContainerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
})

DhtmlxTreeGrid.propTypes = {
  data: PropTypes.array,
  columns: PropTypes.array,
  onAfterTaskAdd: PropTypes.func,
  onAfterTaskUpdate: PropTypes.func,
  onBeforeTaskDelete: PropTypes.func,
  onClickDelete: PropTypes.func,
  onSaveOrder: PropTypes.func,
  onRowClick: PropTypes.func,
  onRowDblClick: PropTypes.func,
  dragMove: PropTypes.bool,
  orderBranch: PropTypes.bool,
  orderBranchFree: PropTypes.bool,
  style: PropTypes.object
}

export default DhtmlxTreeGrid

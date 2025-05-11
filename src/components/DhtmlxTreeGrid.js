import React, {
    useEffect,
    useRef,
    forwardRef,
    useImperativeHandle
} from 'react'
import PropTypes from 'prop-types'
import { setGanttSkin } from './setGanttSkin'

const DhtmlxTreeGrid = forwardRef(function DhtmlxTreeGrid({
                                                              data = [],
                                                              columns = [],
                                                              onAfterTaskAdd,
                                                              onAfterTaskUpdate,
                                                              onBeforeTaskDelete,
                                                              onClickDelete,
                                                              onSaveOrder,
                                                              style = { width: '100%', height: '600px' },
                                                          }, ref) {
    const ganttContainerRef = useRef(null)
    const initializedRef = useRef(false)
    const eventIDsRef = useRef([]) // ✅ 이벤트 ID 저장용

    useEffect(() => {
        if (!window.gantt || initializedRef.current) return
        initializedRef.current = true

        // 기본 설정
        window.gantt.config.editable = true
        window.gantt.config.edit_on_dblclick = true
        window.gantt.config.details_on_dblclick = false
        window.gantt.config.select_task = true
        window.gantt.config.show_chart = false
        window.gantt.config.drag_move = true
        window.gantt.config.order_branch = true
        window.gantt.config.order_branch_free = false

        window.gantt.config.columns = [
            ...columns,
            {
                name: 'delete',
                label: '',
                width: 40,
                align: 'center',
                template: () =>
                    `<span class="delete-icon" style="color:red;cursor:pointer;font-size:16px;">&#10006;</span>`
            }
        ]

        setGanttSkin(getCoreUITheme())

        // ✅ 이벤트 등록 및 ID 추적
        const eid1 = window.gantt.attachEvent('onTaskClick', function (id, e) {
            const target = e.target || e.srcElement
            const cls = target.className || ''

            if (cls.includes('delete-icon')) {
                onClickDelete?.(id)
                return true
            }

            const inlineAPI = window.gantt.ext?.inlineEditors
            if (inlineAPI?.isVisible()) inlineAPI.save()

            window.gantt.selectTask(id)
            return true
        })
        eventIDsRef.current.push(eid1)

        const eid2 = window.gantt.attachEvent('onAfterTaskAdd', (id, item) => {
            onAfterTaskAdd?.(id, item)
        })
        eventIDsRef.current.push(eid2)

        const eid3 = window.gantt.attachEvent('onAfterTaskUpdate', (id, item) => {
            onAfterTaskUpdate?.(id, item)
        })
        eventIDsRef.current.push(eid3)

        const eid4 = window.gantt.attachEvent('onBeforeTaskDelete', (id, item) => {
            return onBeforeTaskDelete?.(id, item) !== false
        })
        eventIDsRef.current.push(eid4)

        const eid5 = window.gantt.attachEvent('onBeforeTaskMove', (id, newParentId) => {
            const task = window.gantt.getTask(id)
            if (newParentId !== task.parent) {
                alert('다른 계층으로는 이동할 수 없습니다.')
                return false
            }
            return true
        })
        eventIDsRef.current.push(eid5)

        const eid6 = window.gantt.attachEvent('onAfterTaskMove', () => {
            const rawList = []
            window.gantt.eachTask(task => {
                rawList.push({
                    id: task.id,
                    index: window.gantt.getTaskIndex(task.id),
                    parent: task.parent
                })
            })
            console.log('📦 정렬 원본 리스트:', rawList)
            onSaveOrder?.(rawList)
        })
        eventIDsRef.current.push(eid6)

        window.gantt.init(ganttContainerRef.current)

        // ✅ 언마운트 시 개별 이벤트 해제
        return () => {
            eventIDsRef.current.forEach(id => window.gantt.detachEvent(id))
            eventIDsRef.current = []
            window.gantt.clearAll?.()
            initializedRef.current = false
        }
    }, [])

    // 데이터 변경 → Gantt 갱신
    useEffect(() => {
        if (!window.gantt) return
        console.log('🔄 [DhtmlxTreeGrid] 데이터 파싱')
        const safeData = data.map(task => ({
            ...task,
            start_date: task.start_date || '2025-01-01',
            duration: task.duration || 1
        }))
        window.gantt.clearAll()
        window.gantt.parse({ data: safeData, links: [] })
    }, [data])

    // 테마 감지
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

    // 외부 호출용 신규 항목 추가
    useImperativeHandle(ref, () => ({
        addNewItem() {
            if (!window.gantt) return
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
    style: PropTypes.object
}

export default DhtmlxTreeGrid

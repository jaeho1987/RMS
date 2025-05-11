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
                                                              style = { width: '100%', height: '600px' },
                                                          }, ref) {

    const ganttContainerRef = useRef(null)

    // (1) 초기화 + 이벤트 등록
    useEffect(() => {
        if (!window.gantt) {
            console.error('❌ dhtmlxGantt가 로드되지 않았습니다.')
            return
        }

        console.log('✅ [DhtmlxTreeGrid] init (no duplication guard)')

        // Gantt 설정
        window.gantt.config.editable = true
        window.gantt.config.edit_on_single_click = false
        window.gantt.config.edit_on_dblclick = true
        window.gantt.config.details_on_dblclick = false
        window.gantt.config.select_task = true
        window.gantt.config.show_chart = false
        window.gantt.config.drag_move = true

        // 컬럼 + 삭제 아이콘
        const allCols = [
            ...columns,
            {
                name: 'delete',
                label: '',
                width: 40,
                align: 'center',
                template: () => `<span class="delete-icon" style="color:red;cursor:pointer;font-size:16px;">&#10006;</span>`
            }
        ]
        window.gantt.config.columns = allCols

        // 테마
        setGanttSkin(getCoreUITheme())

        // 이벤트 등록
        window.gantt.attachEvent('onTaskClick', function (id, e) {
            const target = e.target || e.srcElement
            const cls = target.className || ''

            if (
                cls.indexOf('gantt_tree_icon') !== -1 ||
                cls.indexOf('gantt_close') !== -1 ||
                cls.indexOf('gantt_open') !== -1 ||
                cls.indexOf('gantt_folder') !== -1 ||
                cls.indexOf('gantt_file') !== -1
            ) {
                return true
            }

            if (cls.indexOf('delete-icon') !== -1) {
                onClickDelete?.(id)
                return true
            }

            // 인라인 편집 중이면 저장
            const inlineAPI = window.gantt.ext?.inlineEditors
            if (inlineAPI?.isVisible()) {
                inlineAPI.save()
            }
            window.gantt.selectTask(id)
            return true
        })

        window.gantt.attachEvent('onAfterTaskAdd', (id, item) => {
            onAfterTaskAdd?.(id, item)
        })
        window.gantt.attachEvent('onAfterTaskUpdate', (id, item) => {
            onAfterTaskUpdate?.(id, item)
        })
        window.gantt.attachEvent('onBeforeTaskDelete', (id, item) => {
            if (onBeforeTaskDelete) {
                return onBeforeTaskDelete(id, item) !== false
            }
            return true
        })

        // init
        window.gantt.init(ganttContainerRef.current)

        // cleanup
        return () => {
            console.log('⚠️ [DhtmlxTreeGrid] unmount')
            if (window.gantt?.clearAll) {
                window.gantt.clearAll()
            }
        }
    }, [])
    // ※ deps=[] => 마운트 시 한 번 실행
    // 하지만 React.StrictMode에서 한 번 더 마운트-언마운트 할 수 있어
    //  => 여기선 "중복 보완"을 안 해서 재초기화될 수 있음.

    // (2) data 변경 -> parse
    useEffect(() => {
        if (!window.gantt) return
        console.log('🔄 [DhtmlxTreeGrid] parse data')
        window.gantt.clearAll()
        window.gantt.parse({
            data: data.map(item => ({
                id: item.bizSeq || item.id || window.gantt.uid(),
                parent: item.parentSeq || 0,
                text: item.name || '',
                description: item.description || '',
                start_date: '2025-01-01',
                duration: 1,
                open: true
            })),
            links: []
        })
    }, [data])

    // 테마 변경
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

    // 신규행 추가
    useImperativeHandle(ref, () => ({
        addNewItem() {
            if (!window.gantt) return
            const selectedId = window.gantt.getSelectedId() || 0
            const newId = window.gantt.uid()
            window.gantt.addTask({
                id: newId,
                parent: selectedId,
                text: '새 항목',
                description: '',
                start_date: '2025-01-01',
                duration: 1,
                open: true
            }, selectedId)

            window.gantt.open(parentId)
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
    style: PropTypes.object
}

export default DhtmlxTreeGrid

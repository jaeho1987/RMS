import React, { useEffect, useState, useRef } from 'react'
import { CCard, CCardBody, CButton } from '@coreui/react'
import axiosInstance from 'src/api/axiosInstance'
import DhtmlxTreeGrid from 'src/components/DhtmlxTreeGrid'

function MenuList() {
  const [treeData, setTreeData] = useState([])
  const treeGridRef = useRef(null)

  const columns = [
    {
      name: 'text',
      label: '메뉴명',
      tree: true,
      width: '*',
      editor: { type: 'text', map_to: 'text' }
    },
    {
      name: 'menuPath',
      label: '경로',
      width: 200,
      editor: { type: 'text', map_to: 'menuPath' }
    },
    {
      name: 'menuIcon',
      label: '아이콘',
      width: 150,
      editor: { type: 'text', map_to: 'menuIcon' }
    }
  ]

  useEffect(() => {
    axiosInstance.get('/api/menus')
      .then(res => {
        const formatted = res.data.map((item) => ({
          id: item.menuSeq,
          parent: item.parentSeq || 0,
          text: item.menuName,
          menuPath: item.menuPath || '',
          menuIcon: item.menuIcon || '',
          start_date: '2025-01-01',
          duration: 1,
          open: true,
        }))
        setTreeData(formatted)
      })
      .catch(err => console.error('메뉴 조회 실패:', err))
  }, [])

  const handleNewItem = () => {
    treeGridRef.current?.addNewItem()
  }

  const handleAfterTaskAdd = (tempId, item) => {
    const newData = {
      menuName: item.text,
      menuPath: item.menuPath || '',
      menuIcon: item.menuIcon || '',
      parentSeq: item.parent || 0,
      regId: 'admin'
    }

    axiosInstance.post('/api/menus', newData)
      .then(res => {
        const realId = res.data.menuSeq
        window.gantt.changeTaskId(tempId, realId)
      })
      .catch(() => {
        alert('등록 실패')
        window.gantt.deleteTask(tempId)
      })
  }

  const handleAfterTaskUpdate = (id, item) => {
    const updateData = {
      menuName: item.text,
      menuPath: item.menuPath || '',
      menuIcon: item.menuIcon || '',
      modId: 'admin'
    }

    axiosInstance.put(`/api/menus/${id}`, updateData)
      .then(() => console.log('수정 성공'))
      .catch(() => alert('수정 실패'))
  }

  const handleBeforeTaskDelete = () => true

  const handleClickDelete = (id) => {
    if (window.gantt.hasChild(id)) {
      alert('하위 메뉴가 있어 삭제할 수 없습니다.')
      return
    }

    if (!window.confirm('삭제하시겠습니까?')) return

    axiosInstance.delete(`/api/menus/${id}`)
      .then(() => window.gantt.deleteTask(id))
      .catch(() => alert('삭제 실패'))
  }

  const handleSaveOrder = (rawList) => {
    const mapped = rawList.map(item => ({
      menuSeq: item.id,
      menuOrder: item.index
    }))
    axiosInstance.put('/api/menus/order', mapped)
      .then(() => console.log('정렬 저장 완료 ✅'))
      .catch(() => alert('정렬 저장 실패'))
  }

  return (
    <CCard>
      <CCardBody className="p-0" style={{ height: '700px' }}>
        <div className="d-flex justify-content-end align-items-center gap-2 px-4 py-3">
          <div className="text-body-secondary" style={{ fontSize: '0.85rem' }}>
            행 선택 후 클릭 시 해당 행의 하위에 추가됩니다.
          </div>
          <CButton color="success" onClick={handleNewItem}>
            신규 등록
          </CButton>
        </div>
        <div style={{
          height: 'calc(100% - 56px)',
          padding: '1rem',
          paddingBottom: '2rem'
        }}>
          <DhtmlxTreeGrid
            ref={treeGridRef}
            data={treeData}
            columns={columns}
            onAfterTaskAdd={handleAfterTaskAdd}
            onAfterTaskUpdate={handleAfterTaskUpdate}
            onBeforeTaskDelete={handleBeforeTaskDelete}
            onClickDelete={handleClickDelete}
            onSaveOrder={handleSaveOrder}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </CCardBody>
    </CCard>
  )
}

export default MenuList

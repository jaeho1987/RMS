// BizCodeList.jsx
import React, { useEffect, useState, useRef } from 'react'
import { CCard, CCardHeader, CCardBody, CButton } from '@coreui/react'
import axiosInstance from 'src/api/axiosInstance'
import DhtmlxTreeGrid from 'src/components/DhtmlxTreeGrid'

function BizCodeList() {
  const [treeData, setTreeData] = useState([])

  // Gantt columns (인라인 편집)
  const columns = [
    {
      name: 'text',
      label: '항목명',
      tree: true,
      width: '*',
      editor: { type: 'text', map_to: 'text' }
    },
    {
      name: 'description',
      label: '설명',
      width: 200,
      editor: { type: 'text', map_to: 'description' }
    }
    // "delete" 컬럼은 DhtmlxTreeGrid.jsx에서 추가
  ]

  const treeGridRef = useRef(null)

  // 1) 페이지 로드 => 목록 GET
  useEffect(() => {
    axiosInstance.get('/api/biz-code')
      .then(res => setTreeData(res.data))
      .catch(err => console.error('목록 조회 실패:', err))
  }, [])

  // 2) 신규등록 버튼
  const handleNewItem = () => {
    treeGridRef.current?.addNewItem()
  }

  // 3) onAfterTaskAdd => DB Insert => changeTaskId
  const handleAfterTaskAdd = (tempId, item) => {
    const newData = {
      name: item.text,
      description: item.description || '',
      parentSeq: item.parent || 0,
      regId: 'admin'
    }
    axiosInstance.post('/api/biz-code', newData)
      .then(res => {
        const realId = res.data // 백엔드가 반환한 새 PK
        console.log('등록 성공 =>', realId)
        // 임시 ID => 실제 ID
        window.gantt.changeTaskId(tempId, realId)
      })
      .catch(err => console.error('등록 실패:', err))
  }

  // 4) onAfterTaskUpdate => DB Update
  const handleAfterTaskUpdate = (id, item) => {
    const updateData = {
      name: item.text,
      description: item.description || '',
      modId: 'admin'
    }
    axiosInstance.put(`/api/biz-code/${id}`, updateData)
      .then(res => {
        console.log('수정 성공 =>', res.data)
      })
      .catch(err => console.error('수정 실패 =>', err))
  }

  // 5) onBeforeTaskDelete => "추가 confirm X"
  //    => 그냥 true
  const handleBeforeTaskDelete = (id, item) => {
    return true
  }

  // 6) onClickDelete => 아이콘 클릭 => confirm => axios => deleteTask
  const handleClickDelete = (id) => {
    // 1) 자식 row 유무 검사
    if (window.gantt.hasChild(id)) {
      alert('하위 항목이 있어 삭제할 수 없습니다.')
      return // 삭제 취소
    }

    // 2) 자식이 없으면 -> 기존 삭제 로직 진행
    const ok = window.confirm(`해당 행을 삭제하시겠습니까?`)
    if (!ok) return

    // 백엔드 DELETE
    axiosInstance.delete(`/api/biz-code/${id}`)
      .then(() => {
        console.log('삭제 성공')
        // gantt 상에서도 제거
        window.gantt.deleteTask(id)
      })
      .catch(err => {
        console.error('삭제 실패 =>', err)
        alert(err?.response?.data?.message || '삭제 실패')
      })
  }


  return (
    <CCard className="h-100">
      <CCardHeader style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 'bold' }}>시스템 관리</div>
        <div>
          <span style={{ marginRight: '1rem' }}>
            행 선택 후 클릭 시 해당 행의 하위에 추가
          </span>
          <CButton color="success" onClick={handleNewItem}>
            신규 등록
          </CButton>
        </div>
      </CCardHeader>

      <CCardBody style={{ height: '600px', padding: 0 }}>
        <div style={{ height: '100%', width: '100%', padding: '1rem' }}>
          <DhtmlxTreeGrid
            ref={treeGridRef}
            data={treeData}
            columns={columns}

            // CRUD
            onAfterTaskAdd={handleAfterTaskAdd}
            onAfterTaskUpdate={handleAfterTaskUpdate}
            onBeforeTaskDelete={handleBeforeTaskDelete}

            // 삭제 아이콘 클릭 => handleClickDelete
            onClickDelete={handleClickDelete}

            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </CCardBody>
    </CCard>
  )
}

export default BizCodeList

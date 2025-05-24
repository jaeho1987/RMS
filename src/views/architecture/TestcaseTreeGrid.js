import React, { useEffect, useRef, useState } from 'react'
import DhtmlxTreeGrid from 'src/components/DhtmlxTreeGrid'
import { CCard, CCardBody, CButton } from '@coreui/react'
import axiosInstance from 'src/api/axiosInstance'
import useSelectedSystem from 'src/hooks/useSelectedSystem'
import { normalizeObject, iconTemplate, getCodeName } from 'src/utils/common'

const TestcaseTreeGrid = ({ reqSeq }) => {
  const treeGridRef = useRef(null)
  const [testcaseList, setTestcaseList] = useState([])
  const [addToLast, setAddToLast] = useState(true)  // true: 마지막 항목에 추가, false: 선택된 항목 아래에 추가
  const { system, systemRef } = useSelectedSystem()

  const columns = [
    {
      name: 'text',
      label: '테스트 명',
      tree: true,
      width: 200,
      editor: { type: 'text', map_to: 'testName' }
    },
    {
      name: 'testId',
      label: 'ID',
      width: 120,
    },
    {
      name: 'inputData',
      label: '입력값',
      width: 150,
      editor: { type: 'text', map_to: 'inputData' }
    },
    {
      name: 'expectedResult',
      label: '예상값',
      width: 150,
      editor: { type: 'text', map_to: 'expectedResult' }
    },
    {
      name: 'actualResult',
      label: '실제값',
      width: 150,
      editor: { type: 'text', map_to: 'actualResult' }
    },
    {
      name: 'testStatus',
      label: '상태',
      width: 100,
      editor: { type: 'text', map_to: 'testStatus' }
    },
    {
      name: 'delete',
      label: '',
      width: 40,
      align: 'center',
      template: () => iconTemplate('cil-trash')
    }
  ]

  useEffect(() => {
    if (!reqSeq) return
    axiosInstance.get(`/api/testcases?reqSeq=${reqSeq}`).then((res) => {
      const list = res.data.map(raw => {
        const item = normalizeObject(raw)
        return {
          ...item,
          id: item.testSeq,
          text: item.testName
        }
      })
      setTestcaseList(list)
    })
  }, [reqSeq])

  const reload = () => {
    if (!reqSeq) return
    axiosInstance.get(`/api/testcases?reqSeq=${reqSeq}`).then((res) => {
      const list = res.data.map(raw => {
        const item = normalizeObject(raw)
        return {
          ...item,
          id: item.testSeq,
          text: item.testName
        }
      })
      setTestcaseList(list)
    })
  }

  const handleAddRow = (tempId, row) => {
    if (!system?.sysCode) {
      alert('시스템 코드가 없습니다. 시스템을 먼저 선택하세요.')
      return
    }
    const maxOrder = window.gantt.getTaskCount()-1
    const selected = systemRef.current

    row.reqSeq = reqSeq
    row.bizSeq = selected.bizSeq
    row.sysCode = system.sysCode
    row.testName = '새 테스트케이스'
    row.text = row.testName
    row.inputData = ''
    row.expectedResult = ''
    row.actualResult = ''
    row.testStatus = ''
    row.orderNo = maxOrder // ✅ 마지막 순번 부여

    axiosInstance.post('/api/testcases', row).then((res) => {
      const created = normalizeObject(res.data.result)
      treeGridRef.current?.changeTaskId(tempId, created.testSeq)

      treeGridRef.current?.updateTask(created.testSeq, {
        testId: created.testId,
      })

    })
  }

  const handleUpdateRow = (id, row) => {
    axiosInstance.put(`/api/testcases/${id}`, row).then((res) => {
      if (!res.data.success) {
        alert('수정 실패')
      }
      reload()
    })
  }

  const handleDeleteRow = (id) => {
    if (!window.confirm('삭제하시겠습니까?')) return
    axiosInstance.delete(`/api/testcases/${id}`).then((res) => {
      if (res.data.success) {
        treeGridRef.current?.deleteTask(id)
      } else {
        alert('삭제 실패')
      }
      reload()
    })
  }

  const handleSaveTestcaseOrder = (list) => {
    const mapped = list.map(item => ({
      testSeq: item.id,
      orderNo: item.index,
      modId: 'admin'
    }))
    axiosInstance.put('/api/testcases/order', mapped)
      .then(res => {
        if (!res.data.success) {
          alert('정렬 저장 실패')
        } else {
          console.log('테스트케이스 정렬 저장 완료')
        }
      })
      .catch(() => alert('정렬 저장 실패'))
  }

  const handleAddNewToLast = () => {
    const allIds = treeGridRef.current?.getAllTaskIds?.() || []
    const lastIndex = allIds.length
    treeGridRef.current?.addNewItem(0, lastIndex) // ✅ 항상 마지막에 추가
  }

  return (
    <CCard className="mt-4" style={{ height: '700px' }}>
      <CCardBody>
        <div className="d-flex justify-content-between mb-2">
          <strong>테스트케이스</strong>
          <CButton size="sm" color="success" onClick={handleAddNewToLast}>
            <i className="cil-plus me-1"></i>
            신규 등록
          </CButton>
        </div>
        <DhtmlxTreeGrid
          ref={treeGridRef}
          data={testcaseList}
          addToLast={addToLast}
          columns={columns}
          onAfterAddRow={handleAddRow}
          onAfterUpdateRow={handleUpdateRow}
          onClickDeleteRow={handleDeleteRow}
          onSaveRowOrder={handleSaveTestcaseOrder}
        />
      </CCardBody>
    </CCard>
  )
}

export default TestcaseTreeGrid

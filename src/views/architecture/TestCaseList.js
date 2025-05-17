import React, { useState, useEffect, useRef } from 'react'
import { CCard, CCardBody, CButton, CFormInput, CRow, CCol, CForm } from '@coreui/react'
import { useSelector } from 'react-redux'
import axiosInstance from 'src/api/axiosInstance'
import DhtmlxTreeGrid from 'src/components/DhtmlxTreeGrid'
import SystemSelectModal from './SystemSelectModal'
import RequirementSelectModal from 'src/views/architecture/RequirementSelectModal'
import useSelectedSystem from 'src/hooks/useSelectedSystem'
import { getCodeName, normalizeObject, iconTemplate } from 'src/utils/common'

const TestCaseList = () => {
  const codeMap = useSelector(state => state.codeMap)
  const { system, systemRef, updateSystem } = useSelectedSystem()
  const [testcaseList, setTestcaseList] = useState([])
  const [showPopup, setShowPopup] = useState(false)
  const [dragMove, setDragMove] = useState(false)
  const [requirement, setRequirement] = useState(null)
  const [showReqPopup, setShowReqPopup] = useState(false)
  const treeRef = useRef(null)

  useEffect(() => {
    if (system?.bizSeq) fetchData()
  }, [system])

  const fetchData = () => {
    const selected = systemRef.current
    if (!selected?.bizSeq) return alert('시스템을 선택하세요')

    axiosInstance.get(`/api/testcases/findAll`, {
      params: {
        bizSeq: selected.bizSeq,
        reqSeq: requirement?.reqSeq || undefined,
      }
    }).then((res) => {
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

  const handleAfterUpdateTestcase = (id, item) => {
    axiosInstance.put(`/api/testcases/${id}`, {
      ...item,
      modId: 'admin'
    }).then(res => {
      if (!res.data.success) {
        alert(res.data.message || '수정 실패')
      } else {
        const task = treeRef.current?.getTask(id)
        if (task) {
          task.reqTypeCodeName = getCodeName(codeMap, 'REQ_TYPE', item.reqTypeCode)
          task.priorityCodeName = getCodeName(codeMap, 'REQ_PRIORITY', item.priorityCode)
          task.statusCodeName = getCodeName(codeMap, 'REQ_STATUS', item.statusCode)
          treeRef.current?.refreshTask(id)
        }
      }
    }).catch(() => alert('수정 실패'))
  }

  const handleDeleteTestcase = (id) => {
    if (treeRef.current?.hasChild(id)) return alert('하위 항목이 있어 삭제할 수 없습니다.')
    if (!window.confirm('삭제하시겠습니까?')) return

    axiosInstance.delete(`/api/testcases/${id}`)
      .then(res => {
        if (res.data.success) {
          treeRef.current?.deleteTask(id)
        } else {
          alert(res.data.message || '삭제 실패')
        }
      })
      .catch(() => alert('삭제 실패'))
  }

  const handleSaveTestcaseOrder = (list) => {
    const mapped = list.map(item => ({
      reqSeq: item.id,
      orderNo: item.index,
      modId: 'admin'
    }))
    axiosInstance.put('/api/testcases/order', mapped)
      .then(res => {
        if (res.data.success) {
          console.log('정렬 저장 완료')
        } else {
          alert(res.data.message || '정렬 저장 실패')
        }
      })
      .catch(() => alert('정렬 저장 실패'))
  }

  const handleClickTestcaseRow = (id, e) => {
    if (e.target.classList.contains('icon-delete')) {
      handleDeleteTestcase(id)
    }
  }

  const handleUpdateSystem = (system) => {
    updateSystem(system)
    setRequirement(null)
    setShowPopup(false)
  }

  const columns = [
    { name: 'reqName', label: '요구사항명', tree: true, width: 200 },
    { name: 'text', label: '테스트 명', tree: true, width: 200, editor: { type: 'text', map_to: 'testName' } },
    { name: 'testId', label: 'ID', width: 120 },
    { name: 'inputData', label: '입력값', width: 150, editor: { type: 'text', map_to: 'inputData' } },
    { name: 'expectedResult', label: '예상값', width: 150, editor: { type: 'text', map_to: 'expectedResult' } },
    { name: 'actualResult', label: '실제값', width: 150, editor: { type: 'text', map_to: 'actualResult' } },
    { name: 'testStatus', label: '상태', width: 100, editor: { type: 'text', map_to: 'testStatus' } },
    { name: 'delete', label: '', width: 40, align: 'center', template: () => iconTemplate('cil-trash') }
  ]

  return (
    <>
      <CCard className="mb-3">
        <CCardBody>
          <CForm onSubmit={(e) => { e.preventDefault(); fetchData() }}>
            <CRow className="mb-2">
              <CCol md={4}>
                <CFormInput
                  label="시스템"
                  readOnly
                  value={system?.systemName || ''}
                  onClick={() => setShowPopup(true)}
                  placeholder="시스템을 선택하세요"
                />
              </CCol>
              <CCol md={4}>
                <label className="form-label">요구사항</label>
                <div className="d-flex">
                  <CFormInput
                    readOnly
                    value={requirement?.level3Name || ''}
                    onClick={() => {
                      if (!system?.bizSeq) return alert('먼저 시스템을 선택하세요.')
                      setShowReqPopup(true)
                    }}
                    placeholder="요구사항을 선택하세요"
                    className="me-2"
                  />
                  {requirement && (
                    <CButton
                      color="secondary"
                      variant="outline"
                      onClick={() => setRequirement(null)}
                    >
                      X
                    </CButton>
                  )}
                </div>
              </CCol>
              <CCol md={4} className="d-flex align-items-end justify-content-end">
                <CButton type="submit" color="primary">조회</CButton>
              </CCol>
            </CRow>
          </CForm>
        </CCardBody>
      </CCard>

      <CCard>
        <CCardBody style={{ height: '700px', padding: 0 }}>
          <div style={{ height: 'calc(100% - 48px)', padding: '1rem' }}>
            <DhtmlxTreeGrid
              ref={treeRef}
              data={testcaseList}
              columns={columns}
              onAfterUpdateRow={handleAfterUpdateTestcase}
              onClickDeleteRow={handleDeleteTestcase}
              onSaveRowOrder={handleSaveTestcaseOrder}
              onClickRow={handleClickTestcaseRow}
              dragMove={dragMove}
              orderBranch={dragMove}
            />
          </div>
        </CCardBody>
      </CCard>

      <SystemSelectModal
        visible={showPopup}
        onClose={() => setShowPopup(false)}
        updateSystem={handleUpdateSystem}
      />

      <RequirementSelectModal
        visible={showReqPopup}
        bizSeq={system?.bizSeq}
        onClose={() => setShowReqPopup(false)}
        onSelect={(req) => setRequirement(req)}
      />
    </>
  )
}

export default TestCaseList

import React, { useState, useEffect, useRef } from 'react'
import {
  CCard, CCardBody, CButton,
  CFormInput, CRow, CCol, CForm
} from '@coreui/react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axiosInstance from 'src/api/axiosInstance'
import DhtmlxTreeGrid from 'src/components/DhtmlxTreeGrid'
import SystemSelectModal from './SystemSelectModal'
import useSelectedSystem from 'src/hooks/useSelectedSystem'
import { getCodeName, getCodeOptionsForGantt } from 'src/utils/common'
import { iconTemplate} from 'src/utils/common'

const RequirementList = () => {
  const codeMap = useSelector(state => state.codeMap)
  const { system, systemRef, updateSystem } = useSelectedSystem()
  const [treeData, setTreeData] = useState([])
  const [showPopup, setShowPopup] = useState(false)
  const treeRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (system?.bizSeq) fetchRequirements()
  }, [system])

  const fetchRequirements = () => {
    const selected = systemRef.current
    if (!selected?.bizSeq) return alert('시스템을 선택하세요')

    axiosInstance.get('/api/requirement', {
      params: { bizSeq: selected.bizSeq }
    }).then(res => {
      const list = res.data.map(item => ({
        id: item.reqSeq,
        parent: item.parentSeq || 0,
        reqName: item.reqName,
        reqId: item.reqId,
        reqTypeCode: item.reqTypeCode,
        reqTypeCodeName: getCodeName(codeMap, 'REQ_TYPE', item.reqTypeCode),
        priorityCode: item.priorityCode,
        priorityCodeName: getCodeName(codeMap, 'REQ_PRIORITY', item.priorityCode),
        statusCode: item.statusCode,
        statusCodeName: getCodeName(codeMap, 'REQ_STATUS', item.statusCode),
        orderNo: item.orderNo,
        text: item.reqName,
        open: true
      }))
      setTreeData(list)
    })
  }

  const handleAddRequirement = () => {
    if (!systemRef.current?.bizSeq) {
      alert('시스템을 선택하세요')
      return
    }
    treeRef.current?.addNewItem()
  }

  const handleAfterAddRequirement = (tempId, item) => {
    const selected = systemRef.current
    if (!selected?.bizSeq) {
      alert('시스템 정보가 없습니다.')
      treeRef.current?.deleteTask(tempId)
      return
    }

    const newItem = {
      ...item,
      bizSeq: selected.bizSeq,
      sysCode: selected.sysCode,
      reqName: item.reqName || '요구사항명',
      parentSeq: item.parent || 0,
      reqTypeCode: item.reqTypeCode || 'F01',
      priorityCode: item.priorityCode || 'L',
      statusCode: item.statusCode || '01',
      regId: 'admin'
    }

    axiosInstance.post('/api/requirement', newItem)
      .then(res => {
        if (res.data.success) {
          const created = res.data.result
          treeRef.current?.changeTaskId(tempId, created.reqSeq)

          treeRef.current?.updateTask(created.reqSeq, {
            reqId: created.reqId,
            reqName: created.reqName,
            text: created.reqName,
            reqTypeCodeName: getCodeName(codeMap, 'REQ_TYPE', created.reqTypeCode),
            priorityCodeName: getCodeName(codeMap, 'REQ_PRIORITY', created.priorityCode),
            statusCodeName: getCodeName(codeMap, 'REQ_STATUS', created.statusCode),
          })
        } else {
          alert(res.data.message || '등록 실패')
          treeRef.current?.deleteTask(tempId)
        }
      })
      .catch(() => {
        alert('등록 실패')
        treeRef.current?.deleteTask(tempId)
      })
  }

  const handleAfterUpdateRequirement = (id, item) => {
    console.log('수정 요청 발생', id, item)
    axiosInstance.put(`/api/requirement/${id}`, {
      ...item,
      modId: 'admin'
    }).then(res => {
      if (!res.data.success) {
        alert(res.data.message || '수정 실패')
      } else {
        // ✅ 무한 루프 방지를 위해 updateTask 호출 대신 직접 필드만 갱신
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

  const handleDeleteRequirement = (id) => {
    if (treeRef.current?.hasChild(id)) {
      return alert('하위 항목이 있어 삭제할 수 없습니다.')
    }

    if (!window.confirm('삭제하시겠습니까?')) return

    axiosInstance.delete(`/api/requirement/${id}`)
      .then(res => {
        if (res.data.success) {
          treeRef.current?.deleteTask(id)
        } else {
          alert(res.data.message || '삭제 실패')
        }
      })
      .catch(() => alert('삭제 실패'))
  }

  const handleSaveRequirementOrder = (list) => {
    const mapped = list.map(item => ({
      reqSeq: item.id,
      orderNo: item.index,
      modId: 'admin'
    }))
    axiosInstance.put('/api/requirement/order', mapped)
      .then(res => {
        if (res.data.success) {
          console.log('정렬 저장 완료')
        } else {
          alert(res.data.message || '정렬 저장 실패')
        }
      })
      .catch(() => alert('정렬 저장 실패'))
  }

  const handleClickRequirementRow = (id, e) => {
    if (e.target.classList.contains('icon-detail')) {
      navigate(`/requirement/${id}`)
      return
    }
    if (e.target.classList.contains('icon-delete')) {
      handleDeleteRequirement(id)
      return
    }
  }

  const handleUpdateSystem = (system) => {
    updateSystem(system)
    setShowPopup(false)
  }

  const columns = [
    { name: 'reqName', label: '요구사항명', tree: true, width: '*', editor: { type: 'text', map_to: 'reqName' }},
    {
      name: '상세', label: '상세', width: 80, align: 'center',
      template: () => `
        <svg class="icon-detail" style="width:1.1rem;height:1.1rem;cursor:pointer;">
          <use href="/icons/coreui.svg#cil-search"></use>
        </svg>
      `
    },
    { name: 'reqId', label: '요구사항ID', width: 150, editor: { type: 'text', map_to: 'reqId' }},
    {
      name: 'reqTypeCodeName', label: '유형', width: 120, editor: {
        type: 'select', map_to: 'reqTypeCode',
        options: getCodeOptionsForGantt(codeMap, 'REQ_TYPE')
      }
    },
    {
      name: 'priorityCodeName', label: '우선순위', width: 100, editor: {
        type: 'select', map_to: 'priorityCode',
         options: getCodeOptionsForGantt(codeMap, 'REQ_PRIORITY')
      }
    },
    {
      name: 'statusCodeName', label: '상태', width: 100, editor: {
        type: 'select', map_to: 'statusCode',
        options: getCodeOptionsForGantt(codeMap, 'REQ_STATUS')
      }
    },
    {
      name: 'delete', label: '', width: 40, align: 'center',
      template: () => iconTemplate('cil-trash'),
    }
  ]

  return (
    <>
      <CCard className="mb-3">
        <CCardBody>
          <CForm onSubmit={(e) => { e.preventDefault(); fetchRequirements() }}>
            <CRow className="mb-2">
              <CCol md={6}>
                <CFormInput
                  label="시스템"
                  readOnly
                  value={system?.systemName || ''}
                  onClick={() => setShowPopup(true)}
                  placeholder="시스템을 선택하세요"
                />
              </CCol>
              <CCol md={6} className="d-flex align-items-end justify-content-end">
                <CButton type="submit" color="primary">조회</CButton>
              </CCol>
            </CRow>
          </CForm>
        </CCardBody>
      </CCard>

      <CCard>
        <CCardBody style={{ height: '700px', padding: 0 }}>
          <div className="d-flex justify-content-end align-items-center gap-3 px-4 py-2">
            <div style={{ fontSize: '0.85rem', color: '#999' }}>
              행 선택 후 클릭 시 하위에 추가됩니다.
            </div>
            <CButton color="success" onClick={handleAddRequirement}>신규 등록</CButton>
          </div>
          <div style={{ height: 'calc(100% - 48px)', padding: '1rem' }}>
            <DhtmlxTreeGrid
              ref={treeRef}
              data={treeData}
              columns={columns}
              onAfterAddRow={handleAfterAddRequirement}
              onAfterUpdateRow={handleAfterUpdateRequirement}
              onClickDeleteRow={handleDeleteRequirement}
              onSaveRowOrder={handleSaveRequirementOrder}
              onClickRow={handleClickRequirementRow}
            />
          </div>
        </CCardBody>
      </CCard>

      <SystemSelectModal
        visible={showPopup}
        onClose={() => setShowPopup(false)}
        updateSystem={handleUpdateSystem}
      />
    </>
  )
}

export default RequirementList

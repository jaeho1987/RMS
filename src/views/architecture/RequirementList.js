import React, { useState, useEffect, useRef } from 'react'
import {
  CCard, CCardBody, CButton,
  CFormInput, CRow, CCol, CForm
} from '@coreui/react'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import axiosInstance from 'src/api/axiosInstance'
import DhtmlxTreeGrid from 'src/components/DhtmlxTreeGrid'
import { useNavigate } from 'react-router-dom'
import SystemSelectModal from './SystemSelectModal'
import useSelectedSystem from 'src/hooks/useSelectedSystem'

const RequirementList = () => {
  const codeMap = useSelector(state => state.codeMap)
  const { system, systemRef, updateSystem } = useSelectedSystem()
  const [treeData, setTreeData] = useState([])
  const [showPopup, setShowPopup] = useState(false)
  const treeRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (system?.bizSeq) {
      fetchRequirements()
    }
  }, [system])

  const fetchRequirements = () => {
    const selected = systemRef.current
    if (!selected?.bizSeq) {
      alert('시스템을 선택하세요')
      return
    }

    axiosInstance.get('/api/requirement', {
      params: { bizSeq: selected.bizSeq }
    }).then(res => {
      const list = res.data.map(item => ({
        id: item.reqSeq,
        parent: item.parentSeq || 0,
        reqName: item.reqName,
        reqId: item.reqId,
        reqTypeCode: item.reqTypeCode,
        priorityCode: item.priorityCode,
        statusCode: item.statusCode,
        orderNo: item.orderNo,
        text: item.reqName,
        open: true
      }))
      setTreeData(list)
    })
  }

  const columns = [
    { name: 'reqName', label: '요구사항명', tree: true, width: '*', editor: { type: 'text', map_to: 'reqName' }},
    { name: 'reqId', label: '요구사항ID', width: 150, editor: { type: 'text', map_to: 'reqId' }},
    {
      name: 'reqTypeCode', label: '유형', width: 120, editor: {
        type: 'select', map_to: 'reqTypeCode',
        options: (codeMap.REQ_TYPE || []).map(c => ({ id: c.codeSeq, value: c.codeName }))
      }
    },
    {
      name: 'priorityCode', label: '우선순위', width: 100, editor: {
        type: 'select', map_to: 'priorityCode',
        options: (codeMap.REQ_PRIORITY || []).map(c => ({ id: c.codeSeq, value: c.codeName }))
      }
    },
    {
      name: 'statusCode', label: '상태', width: 100, editor: {
        type: 'select', map_to: 'statusCode',
        options: (codeMap.REQ_STATUS || []).map(c => ({ id: c.codeSeq, value: c.codeName }))
      }
    },
    {
      name: '상세', label: '상세', width: 60,
      template: item => `<button class="btn-detail" data-id="${item.id}">🔍</button>`
    },
    {
      name: 'delete', label: '', width: 40, align: 'center',
      template: () =>
        `<span class="delete-icon" style="color:red;cursor:pointer;font-size:16px;">&#10006;</span>`
    }
  ]

  const handleClickNew = () => {
    if (!systemRef.current?.bizSeq) {
      alert('시스템을 선택하세요')
      return
    }
    treeRef.current?.addNewItem()
  }

  const handleAfterAdd = (tempId, item) => {
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
      regId: 'admin'
    }

    axiosInstance.post('/api/requirement', newItem)
      .then(res => {
        treeRef.current?.changeTaskId(tempId, res.data.reqSeq)
      })
      .catch(() => {
        alert('등록 실패')
        treeRef.current?.deleteTask(tempId)
      })
  }

  const handleAfterUpdate = (id, item) => {
    axiosInstance.put(`/api/requirement/${id}`, {
      ...item,
      modId: 'admin'
    }).catch(() => alert('수정 실패'))
  }

  const handleDelete = (id) => {
    if (treeRef.current?.hasChild(id)) {
      alert('하위 항목이 있어 삭제할 수 없습니다.')
      return
    }

    if (!window.confirm('삭제하시겠습니까?')) return

    axiosInstance.delete(`/api/requirement/${id}`)
      .then(() => treeRef.current?.deleteTask(id))
      .catch(() => alert('삭제 실패'))
  }

  const handleSaveOrder = (list) => {
    const payload = list.map(item => ({
      reqSeq: item.id,
      orderNo: item.index,
      modId: 'admin'
    }))
    axiosInstance.put('/api/requirement/order', payload)
      .then(() => console.log('정렬 저장 완료'))
      .catch(() => alert('정렬 저장 실패'))
  }

  const handleRowClick = (id, e) => {
    if (e.target.classList.contains('btn-detail')) {
      navigate(`/requirement/${id}`)
    }
  }
  const handleUpdateSystem = (system) => {
    updateSystem(system)  // 전역 상태, localStorage, ref 모두 반영됨
    setShowPopup(false)   // 모달 닫기
  }

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
                <CButton type="submit" color="primary">
                  조회
                </CButton>
              </CCol>
            </CRow>
          </CForm>
        </CCardBody>
      </CCard>

      <CCard>
        <CCardBody style={{ height: '700px', padding: 0 }}>
          <div className="d-flex justify-content-end align-items-center gap-3 px-4 py-2">
            <div style={{ fontSize:'0.85rem', color:'#999' }}>
              행 선택 후 클릭 시 하위에 추가됩니다.
            </div>
            <CButton color="success" onClick={handleClickNew}>신규 등록</CButton>
          </div>
          <div style={{ height: 'calc(100% - 48px)', padding: '1rem' }}>
            <DhtmlxTreeGrid
              ref={treeRef}
              data={treeData}
              columns={columns}
              onAfterTaskAdd={handleAfterAdd}
              onAfterTaskUpdate={handleAfterUpdate}
              onClickDelete={handleDelete}
              onSaveOrder={handleSaveOrder}
              onRowClick={handleRowClick}
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

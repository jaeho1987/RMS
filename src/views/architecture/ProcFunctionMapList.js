import React, { useEffect, useRef, useState } from 'react'
import {
  CCard, CCardBody, CFormInput, CForm, CButton, CRow, CCol
} from '@coreui/react'
import axiosInstance from 'src/api/axiosInstance'
import DhtmlxTreeGrid from 'src/components/DhtmlxTreeGrid'
import SystemSelectModal from './SystemSelectModal'
import useSelectedSystem from 'src/hooks/useSelectedSystem'
import { normalizeObject, getCodeName } from 'src/utils/common'

const ProcFunctionMapList = () => {
  const { system, systemRef, updateSystem } = useSelectedSystem()
  const [treeData, setTreeData] = useState([])
  const [showPopup, setShowPopup] = useState(false)
  const treeRef = useRef(null)

  useEffect(() => {
    if (system?.bizSeq) fetchData()
  }, [system])

  const fetchData = () => {
    const selected = systemRef.current
    if (!selected?.bizSeq) return alert('시스템을 선택하세요')

    axiosInstance.get('/api/procFunctionMap', {
      params: { bizSeq: selected.bizSeq }
    }).then(res => {
      const data = res.data.map(raw => {
        const item = normalizeObject(raw)
        return {
          ...item,
          id: item.procFncSeq,
          parent: 0,
          text: item.funcName,
          statusName: getCodeName(codeMap, 'PROC_FUNC_STATUS', item.status),
          open: true
        }
      })
      setTreeData(data)
    })
  }


  const handleAdd = () => {
    if (!systemRef.current?.bizSeq) return alert('시스템을 선택하세요')
    treeRef.current?.addNewItem()
  }

  const handleAfterAdd = (tempId, item) => {
    const selected = systemRef.current
    const newItem = {
      ...item,
      bizSeq: selected.bizSeq,
      funcId: item.funcId || '',
      funcName: item.funcName || '기능명',
      procName: item.procName || '',
      callPath: item.callPath || '',
      status: item.status || '정의중',
      regId: 'admin'
    }

    axiosInstance.post('/api/procFunctionMap', newItem)
      .then(res => {
        if (res.data.success) {
          const created = res.data.result
          treeRef.current?.changeTaskId(tempId, created.procFncSeq)
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

  const handleAfterUpdate = (id, item) => {
    axiosInstance.put(`/api/procFunctionMap/${id}`, {
      ...item,
      modId: 'admin'
    }).then(res => {
      if (!res.data.success) alert(res.data.message || '수정 실패')
    }).catch(() => alert('수정 실패'))
  }

  const handleDelete = (id) => {
    if (!window.confirm('삭제하시겠습니까?')) return
    axiosInstance.delete(`/api/procFunctionMap/${id}`)
      .then(res => {
        if (res.data.success) {
          treeRef.current?.deleteTask(id)
        } else {
          alert(res.data.message || '삭제 실패')
        }
      })
      .catch(() => alert('삭제 실패'))
  }

  const handleSaveOrder = (list) => {
    const ordered = list.map((item, idx) => ({
      procFncSeq: item.id,
      orderNo: idx + 1,
      modId: 'admin'
    }))
    axiosInstance.put('/api/procFunctionMap/order', ordered)
      .then(res => {
        if (!res.data.success) alert(res.data.message || '정렬 저장 실패')
      }).catch(() => alert('정렬 저장 실패'))
  }

  const columns = [
    { name: 'funcId', label: '기능 ID', width: 150, editor: { type: 'text', map_to: 'funcId' } },
    { name: 'funcName', label: '기능명', width: '*', tree: true, editor: { type: 'text', map_to: 'funcName' } },
    { name: 'procName', label: '프로시저명', width: 200, editor: { type: 'text', map_to: 'procName' } },
    { name: 'callPath', label: '호출 경로', width: 200, editor: { type: 'text', map_to: 'callPath' } },
    { name: 'status', label: '상태', width: 100, editor: { type: 'text', map_to: 'status' } },
    {
      name: 'delete', label: '', width: 40, align: 'center',
      template: () => `
        <svg class="icon-delete" style="width:1.1rem;height:1.1rem;cursor:pointer;">
          <use href="/icons/coreui.svg#cil-trash"></use>
        </svg>`
    }
  ]

  return (
    <>
      <CCard className="mb-3">
        <CCardBody>
          <CForm onSubmit={(e) => { e.preventDefault(); fetchData() }}>
            <CRow>
              <CCol md={6}>
                <CFormInput
                  label="시스템"
                  readOnly
                  value={system?.systemName || ''}
                  onClick={() => setShowPopup(true)}
                  placeholder="시스템을 선택하세요"
                />
              </CCol>
              <CCol md={6} className="d-flex justify-content-end align-items-end">
                <CButton type="submit" color="primary">조회</CButton>
              </CCol>
            </CRow>
          </CForm>
        </CCardBody>
      </CCard>

      <CCard>
        <CCardBody style={{ height: '700px', padding: 0 }}>
          <div className="d-flex justify-content-end gap-2 px-4 py-2">
            <div style={{ fontSize: '0.85rem', color: '#999' }}>
              행 선택 후 클릭 시 하위에 추가됩니다.
            </div>
            <CButton color="success" onClick={handleAdd}>신규 등록</CButton>
          </div>
          <div style={{ height: 'calc(100% - 48px)', padding: '1rem' }}>
            <DhtmlxTreeGrid
              ref={treeRef}
              data={treeData}
              columns={columns}
              onAfterAddRow={handleAfterAdd}
              onAfterUpdateRow={handleAfterUpdate}
              onClickDeleteRow={handleDelete}
              onSaveRowOrder={handleSaveOrder}
            />
          </div>
        </CCardBody>
      </CCard>

      <SystemSelectModal
        visible={showPopup}
        onClose={() => setShowPopup(false)}
        updateSystem={updateSystem}
      />
    </>
  )
}

export default ProcFunctionMapList

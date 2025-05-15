import React, { useEffect, useState, useRef } from 'react'
import { CCard, CCardBody, CButton } from '@coreui/react'
import axiosInstance from 'src/api/axiosInstance'
import DhtmlxTreeGrid from 'src/components/DhtmlxTreeGrid'

function BizCodeList() {
  const [treeData, setTreeData] = useState([])
  const treeGridRef = useRef(null)

  const columns = [
    {
      name: 'text',
      label: '항목명',
      tree: true,
      width: '*',
      editor: { type: 'text', map_to: 'text' }
    },
    {
      name: 'sysCode',
      label: '시스템코드',
      width: 120,
      editor: { type: 'text', map_to: 'sysCode' }
    },
    {
      name: 'description',
      label: '설명',
      width: 200,
      editor: { type: 'text', map_to: 'description' }
    },
    {
      name: 'levelNo',
      label: '레벨',
      width: 80
    },
    {
      name: 'delete',
      label: '',
      width: 40,
      align: 'center',
      template: () =>
        `<svg class="icon-delete" style="width:1.1rem;height:1.1rem;cursor:pointer;fill:var(--cui-danger)">
          <use href="/icons/coreui.svg#cil-trash"></use>
        </svg>`
    }
  ]

  useEffect(() => {
    fetchBizCodeList()
  }, [])

  const fetchBizCodeList = () => {
    axiosInstance.get('/api/biz-code')
      .then(res => {
        const formatted = res.data.map(item => ({
          id: item.bizSeq,
          parent: item.parentSeq || 0,
          text: item.name,
          sysCode: item.sysCode || '',
          description: item.description || '',
          levelNo: item.levelNo || 1,
          start_date: '2025-01-01',
          duration: 1,
          open: true
        }))
        setTreeData(formatted)
      })
      .catch(err => console.error('목록 조회 실패:', err))
  }

  const handleAddBizCode = () => {
    treeGridRef.current?.addNewItem()
  }

  const clearSysCode = (id) => {
    const task = window.gantt.getTask(id)
    task.sysCode = ''
    window.gantt.refreshTask(id)
  }

  const validateSysCode = async (sysCode, currentId = null) => {
    if (sysCode && sysCode.length > 10) {
      alert('시스템코드는 10자 이하로 입력해야 합니다.')
      return false
    }

    try {
      const res = await axiosInstance.post('/api/biz-code/check-sys-code', {
        sysCode,
        bizSeq: currentId || null
      })
      if (res.data.exists) {
        alert('이미 사용 중인 시스템코드입니다.')
        return false
      }
    } catch (err) {
      alert('시스템코드 중복 검사 실패')
      return false
    }

    return true
  }

  const handleAfterAddBizCode = async (tempId, item) => {
    const sysCode = item.sysCode || ''

    if (sysCode.length > 10) {
      alert('시스템코드는 10자 이하로 입력해야 합니다.')
      clearSysCode(tempId)
      return
    }

    const isValid = await validateSysCode(sysCode)
    if (!isValid) {
      clearSysCode(tempId)
      window.gantt.deleteTask(tempId)
      return
    }

    const parentId = item.parent || 0
    const parentTask = parentId !== 0 ? window.gantt.getTask(parentId) : null
    const levelNo = parentTask ? (parentTask.levelNo || 1) + 1 : 1

    const newData = {
      name: item.text,
      sysCode,
      description: item.description || '',
      parentSeq: parentId,
      levelNo,
      regId: 'admin'
    }

    axiosInstance.post('/api/biz-code', newData)
      .then(res => {
        const realId = res.data
        window.gantt.changeTaskId(tempId, realId)
        const task = window.gantt.getTask(realId)
        task.levelNo = levelNo
        window.gantt.refreshTask(realId)
      })
      .catch(() => {
        alert('등록 실패')
        window.gantt.deleteTask(tempId)
      })
  }

  const handleAfterUpdateBizCode = async (id, item) => {
    const sysCode = item.sysCode || ''

    if (sysCode.length > 10) {
      alert('시스템코드는 10자 이하로 입력해야 합니다.')
      clearSysCode(id)
      return
    }

    const isValid = await validateSysCode(sysCode, id)
    if (!isValid) {
      clearSysCode(id)
      return
    }

    const updateData = {
      name: item.text,
      sysCode,
      description: item.description || '',
      modId: 'admin'
    }

    axiosInstance.put(`/api/biz-code/${id}`, updateData)
      .then(() => console.log('수정 성공'))
      .catch(() => alert('수정 실패'))
  }

  const handleBeforeDeleteBizCode = () => true

  const handleDeleteBizCode = (id) => {
    if (window.gantt.hasChild(id)) {
      alert('하위 항목이 있어 삭제할 수 없습니다.')
      return
    }

    if (!window.confirm('삭제하시겠습니까?')) return

    axiosInstance.delete(`/api/biz-code/${id}`)
      .then(() => window.gantt.deleteTask(id))
      .catch(() => alert('삭제 실패'))
  }

  const handleSaveBizCodeOrder = (rawList) => {
    const mapped = rawList.map(item => ({
      bizSeq: item.id,
      orderNo: item.index
    }))
    axiosInstance.put('/api/biz-code/order', mapped)
      .then(() => console.log('정렬 저장 완료 ✅'))
      .catch(() => alert('정렬 저장 실패'))
  }

  return (
    <CCard>
      <CCardBody className="p-0" style={{ height: '700px' }}>
        <div className="d-flex justify-content-end gap-2 px-4 py-3">
          <div className="text-body-secondary align-self-center" style={{ fontSize: '0.85rem' }}>
            행 선택 후 클릭 시 해당 행의 하위에 추가됩니다.
          </div>
          <CButton color="success" onClick={handleAddBizCode}>
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
            onAfterAddRow={handleAfterAddBizCode}
            onAfterUpdateRow={handleAfterUpdateBizCode}
            onBeforeDeleteRow={handleBeforeDeleteBizCode}
            onClickDeleteRow={handleDeleteBizCode}
            onSaveRowOrder={handleSaveBizCodeOrder}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </CCardBody>
    </CCard>
  )
}

export default BizCodeList

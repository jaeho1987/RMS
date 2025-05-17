// src/views/architecture/RequirementSelectModal.js
import React, { useEffect, useState } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
} from '@coreui/react'
import axiosInstance from 'src/api/axiosInstance'
import DhtmlxGrid from 'src/components/DhtmlxGrid'

const RequirementSelectModal = ({ visible, onClose, bizSeq, onSelect }) => {
  const [gridData, setGridData] = useState([])

  useEffect(() => {
    if (!visible || !bizSeq) return
    axiosInstance.get('/api/requirement/flat-list', {
      params: { bizSeq }
    })
    .then(
      res => setGridData(res.data?.result || [])
    )
    .catch(() => alert('요구사항 목록 조회 실패'))
  }, [visible, bizSeq])

  const handleRowDblClick = (row) => {
    if (!row?.reqSeq) {
      alert('요구사항 항목만 선택할 수 있습니다.')
      return
    }
    onSelect?.(row)
    onClose?.()
  }

  const columns = [
    { id: 'level1Name', header: '대분류', width: 150 },
    { id: 'level2Name', header: '중분류', width: 150 },
    { id: 'level3Name', header: '요구사항명', fillspace: true },
    { id: 'reqId', header: '요구사항ID', width: 150 },
    { id: 'reqTypeName', header: '유형', width: 120 },
    { id: 'priorityName', header: '우선순위', width: 120 },
  ]

  const gridConfig = {
    columns,
    height: 500,
    autoWidth: true,
    resizable: true,
  }

  return (
    <CModal visible={visible} onClose={onClose} size="xl">
      <CModalHeader closeButton>
        <CModalTitle>요구사항 선택</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <DhtmlxGrid
          data={gridData}
          config={gridConfig}
          onRowDblClick={handleRowDblClick}
        />
      </CModalBody>
    </CModal>
  )
}

export default RequirementSelectModal

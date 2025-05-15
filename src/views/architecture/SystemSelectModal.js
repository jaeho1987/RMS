import React, { useEffect, useState } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
} from '@coreui/react'
import axiosInstance from 'src/api/axiosInstance'
import DhtmlxGrid from 'src/components/DhtmlxGrid'

const SystemSelectModal = ({ visible, onClose, updateSystem }) => {
  const [gridData, setGridData] = useState([])

  useEffect(() => {
    if (!visible) return

    axiosInstance.get('/api/biz-code/flat-list')
      .then(res => {
        setGridData(res.data)
      })
      .catch(() => {
        alert('시스템 목록 조회 실패')
      })
  }, [visible])

  // ✅ 더블클릭 시 선택 처리
  const handleRowDblClick = (row, col, ev) => {
    if (!row) return
    if (!row.systemName || !row.bizSeq) {
      alert('시스템(3레벨) 항목만 선택할 수 있습니다.')
      return
    }

    updateSystem?.(row)
  }

  const columns = [
    { id: 'domainName', header: '도메인', width: 150 },
    { id: 'groupName', header: '그룹', width: 150 },
    { id: 'systemName', header: '시스템', width: 150 },
    { id: 'sysCode', header: '시스템코드', width: 120 },
    { id: 'description', header: '설명', fillspace: true }
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
        <CModalTitle>시스템 선택</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <DhtmlxGrid
          data={gridData}
          config={gridConfig}
          onRowDblClick={handleRowDblClick} // ✅ 더블클릭에 연결
        />
      </CModalBody>
    </CModal>
  )
}

export default SystemSelectModal

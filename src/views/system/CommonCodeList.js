import React, { useEffect, useState, useRef } from 'react'
import { CCard, CCardBody, CCol, CForm, CFormInput, CRow, CButton } from '@coreui/react'
import axiosInstance from 'src/api/axiosInstance'
import DhtmlxTreeGrid from 'src/components/DhtmlxTreeGrid'

function CommonCodeList() {
  const [filter, setFilter] = useState({
    codeGroup: '',
    codeName: ''
  })

  const [treeData, setTreeData] = useState([])
  const treeGridRef = useRef(null)

  const columns = [
    { name: 'codeGroup', label: '그룹코드', tree: true, width: 200, editor: { type: 'text', map_to: 'codeGroup' }},
    { name: 'codeId', label: '코드ID', width: 120, editor: { type: 'text', map_to: 'codeId' }},
    { name: 'codeName', label: '코드명', width: '*', editor: { type: 'text', map_to: 'codeName' }},
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
    fetchCommonCodeList()
  }, [])

  const fetchCommonCodeList = () => {
    axiosInstance.get('/api/common-code', {
      params: {
        codeGroup: filter.codeGroup.trim(),
        codeName: filter.codeName.trim(),
      }
    })
      .then(res => {
        const list = res.data.map(item => ({
          id: item.codeSeq,
          parent: item.parentSeq || 0,
          codeGroup: item.codeGroup || '',
          codeId: item.codeId || '',
          codeName: item.codeName || '',
          sortOrder: item.sortOrder || 0,
          text: item.codeName,
          open: true
        }))
        setTreeData(list)
      })
      .catch(err => console.error('공통코드 조회 실패 =>', err))
  }

  const handleChangeFilter = (e) => {
    const { name, value } = e.target
    setFilter(prev => ({ ...prev, [name]: value }))
  }

  const handleSearchCommonCode = (e) => {
    e.preventDefault()
    fetchCommonCodeList()
  }

  const handleAddCommonCode = () => {
    treeGridRef.current?.addNewItem()
  }

  const handleAfterAddCommonCode = (tempId, item) => {
    const newData = {
      codeGroup: item.codeGroup || 'DefaultGroup',
      codeId: item.codeId || 'DefaultCode',
      codeName: item.text || '',
      sortOrder: item.sortOrder || 0,
      parentSeq: item.parent || 0,
      regId: 'admin'
    }

    axiosInstance.post('/api/common-code', newData)
      .then(res => {
        // 필요 시 changeTaskId(tempId, res.data.codeSeq)
      })
      .catch(err => {
        console.error('등록 실패 =>', err)
        window.gantt.deleteTask(tempId)
      })
  }

  const handleAfterUpdateCommonCode = (id, item) => {
    const updData = {
      codeGroup: item.codeGroup || 'GROUP',
      codeId: item.codeId || '1',
      codeName: item.text || '코드명',
      sortOrder: item.sortOrder || 0,
      modId: 'admin'
    }

    axiosInstance.put(`/api/common-code/${id}`, updData)
      .then(() => console.log('수정 성공'))
      .catch(err => alert('수정 실패'))
  }

  const handleBeforeDeleteCommonCode = () => true

  const handleDeleteCommonCode = (id) => {
    if (window.gantt.hasChild(id)) {
      alert('하위 항목이 있어 삭제할 수 없습니다.')
      return
    }
    if (!window.confirm('삭제하시겠습니까?')) return

    axiosInstance.delete(`/api/common-code/${id}`)
      .then(() => window.gantt.deleteTask(id))
      .catch(err => alert('삭제 실패'))
  }

  const handleSaveCommonCodeOrder = (rawList) => {
    const mapped = rawList.map(item => ({
      codeSeq: item.id,
      sortOrder: item.index,
      modId: 'admin'
    }))
    axiosInstance.put('/api/common-code/order', mapped)
      .then(() => console.log('정렬 저장'))
      .catch(err => alert('정렬 저장 실패'))
  }

  return (
    <>
      <CCard className="mb-3">
        <CCardBody>
          <CForm onSubmit={handleSearchCommonCode}>
            <CRow className="mb-2">
              <CCol md={4}>
                <CFormInput
                  label="그룹코드"
                  name="codeGroup"
                  value={filter.codeGroup}
                  onChange={handleChangeFilter}
                />
              </CCol>
              <CCol md={4}>
                <CFormInput
                  label="코드명"
                  name="codeName"
                  value={filter.codeName}
                  onChange={handleChangeFilter}
                />
              </CCol>
            </CRow>
            <div className="d-flex justify-content-end">
              <CButton type="submit" color="primary">
                조회
              </CButton>
            </div>
          </CForm>
        </CCardBody>
      </CCard>

      <CCard>
        <CCardBody style={{ height: '600px', padding: 0 }}>
          <div className="d-flex justify-content-end align-items-center gap-3 px-4 py-2">
            <div style={{ fontSize: '0.85rem', color: '#999' }}>
              행 선택 후 클릭 시 해당 행의 하위에 추가됩니다.
            </div>
            <CButton color="success" onClick={handleAddCommonCode}>
              신규 등록
            </CButton>
          </div>

          <div style={{ height: 'calc(100% - 48px)', padding: '1rem' }}>
            <DhtmlxTreeGrid
              ref={treeGridRef}
              data={treeData}
              columns={columns}
              onAfterAddRow={handleAfterAddCommonCode}
              onAfterUpdateRow={handleAfterUpdateCommonCode}
              onBeforeDeleteRow={handleBeforeDeleteCommonCode}
              onClickDeleteRow={handleDeleteCommonCode}
              onSaveRowOrder={handleSaveCommonCodeOrder}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </CCardBody>
      </CCard>
    </>
  )
}

export default CommonCodeList

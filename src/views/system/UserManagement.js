import React, { useEffect, useState } from 'react'
import { CCard, CCardBody, CCol, CForm, CFormInput, CRow, CButton } from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from 'src/api/axiosInstance'
import DhtmlxGrid from 'src/components/DhtmlxGrid'

const UserList = () => {
  const navigate = useNavigate()
  const [filter, setFilter] = useState({ userId: '', addRess: '', telNo: '' })
  const [data, setData] = useState([])

  const fetchData = async () => {
      const res = await axiosInstance.get('/api/system/users')
      setData(res.data)
  }
  useEffect(() => {
    fetchData()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFilter((prev) => ({ ...prev, [name]: value }))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchData()
  }

  const gridConfig = {
    theme: document.documentElement.getAttribute('data-core-theme') || 'light',
    height: 400,
    autoWidth: true,
    columns: [
      { id: 'userId', header: [{ text: '사원ID' }], width: 200 },
      { id: 'bizNo', header: [{ text: '사원명' }], width: 150 },
      { id: 'telNo', header: [{ text: '전화번호' }], width: 150 },
      { id: 'address', header: [{ text: '주소' }], fillspace: true },
    ],
    contextMenu: true,
  }

  return (
    <>
      <CCard className="mb-3">
        <CCardBody>
          <CForm onSubmit={handleSearch}>
            <CRow className="mb-2">
              <CCol md={4}>
                <CFormInput
                  label="사원ID"
                  name="userId"
                  value={filter.userId}
                  onChange={handleChange}
                />
              </CCol>
              <CCol md={4}>
                <CFormInput
                  label="사원명"
                  name="bizNo"
                  value={filter.bizNo}
                  onChange={handleChange}
                />
              </CCol>
              <CCol md={4}>
                <CFormInput
                  label="전화번호"
                  name="telNo"
                  value={filter.telNo}
                  onChange={handleChange}
                />
              </CCol>
              <CCol md={4}>
                <CFormInput
                  label="주소"
                  name="addRess"
                  value={filter.addRess}
                  onChange={handleChange}
                />
              </CCol>
            </CRow>
            <div className="d-flex justify-content-end">
              <CButton type="button" color="primary" onClick={fetchData}>
                조회
              </CButton>
            </div>
          </CForm>
        </CCardBody>
      </CCard>

      <CCard>
        <CCardBody>
          <div className="d-flex justify-content-end mb-3">
            <CButton color="success" onClick={() => navigate('/system/company/new')}>
              신규 등록
            </CButton>
          </div>
          <DhtmlxGrid
            data={data}
            config={gridConfig}
            onRowClick={(row) => navigate(`/system/company/${row.userId}`)}
          />
        </CCardBody>
      </CCard>
    </>
  )
}

export default UserList

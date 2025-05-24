import React, { useEffect, useState } from 'react'
import { CCard, CCardBody, CCol, CForm, CFormInput, CRow, CButton } from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from 'src/api/axiosInstance'
import DhtmlxGrid from 'src/components/DhtmlxGrid'

const UserList = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState({ userId: '', addRess: '', telNo: '' })
  const [data, setData] = useState([])

  const fetchData = async () => {
      const res = await axiosInstance.get('/api/users')
      setData(res.data)
  }
  useEffect(() => {
    fetchData()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setSearch((prev) => ({ ...prev, [name]: value }))
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
      { id: 'userName', header: [{ text: '사용자명' }], width: 150 },
      { id: 'role', header: [{ text: '역할' }], width: 150 },
      { id: 'email', header: [{ text: '이메일', fillspace: true }]},
    ],
    contextMenu: true,
  }

  return (
    <>
      <CCard className="mb-3">
        <CCardBody>
          <CForm onSubmit={handleSearch}>
            <CRow className="mb-2">
              <CCol md={6}>
                <CFormInput
                  label="사용자명"
                  name="bizNo"
                  value={search.bizNo}
                  onChange={handleChange}
                />
              </CCol>
              <CCol md={6} className="d-flex align-items-end justify-content-end">
                <CButton type="button" color="primary" onClick={fetchData}>조회</CButton>
              </CCol>
            </CRow>
          </CForm>
        </CCardBody>
      </CCard>

      <CCard>
        <CCardBody>
          <div className="d-flex justify-content-end mb-3">
            <CButton color="success" onClick={() => navigate('/system/userForm/new')}>
              신규 등록
            </CButton>
          </div>
          <DhtmlxGrid
            data={data}
            config={gridConfig}
            onRowClick={(row) => navigate(`/system/userForm/${row.userId}`)}
          />
        </CCardBody>
      </CCard>
    </>
  )
}

export default UserList

import React, { useEffect, useState } from 'react'
import { CCard, CCardBody, CCol, CForm, CFormInput, CRow, CButton } from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from 'src/api/axiosInstance'
import DhtmlxCompanyGrid from 'src/components/DhtmlxCompanyGrid'

const CompanyList = () => {
  const navigate = useNavigate()
  const [filter, setFilter] = useState({ companyName: '', bizNo: '', telNo: '' })
  const [data, setData] = useState([])

  const fetchData = async () => {
      const res = await axiosInstance.get('/api/system/companies', { params: filter })
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
      { id: 'companyName', header: [{ text: '회사명' }], width: 200 },
      { id: 'bizNo', header: [{ text: '사업자번호' }], width: 150 },
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
                  label="회사명"
                  name="companyName"
                  value={filter.companyName}
                  onChange={handleChange}
                />
              </CCol>
              <CCol md={4}>
                <CFormInput
                  label="사업자번호"
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
        <CCardBody>
          <div className="d-flex justify-content-end mb-3">
            <CButton color="success" onClick={() => navigate('/system/company/new')}>
              신규 등록
            </CButton>
          </div>
          <DhtmlxCompanyGrid
            data={data}
            config={gridConfig}
            onRowClick={(row) => navigate(`/system/company/${row.companySeq}`)}
          />
        </CCardBody>
      </CCard>
    </>
  )
}

export default CompanyList

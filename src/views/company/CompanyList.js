import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CForm,
  CFormInput,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const CompanyList = () => {
  const navigate = useNavigate()
  const [filter, setFilter] = useState({
    companyName: '',
    bizNo: '',
    telNo: '',
  })
  const [list, setList] = useState([])

  const fetchList = async () => {
    try {
      const res = await axios.get('/api/system/companies', { params: filter })
      setList(res.data)
    } catch (err) {
      console.error(err)
      alert('목록 조회에 실패했습니다.')
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFilter({ ...filter, [name]: value })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchList()
  }

  return (
    <>
      {/* 🔍 조회영역 */}
      <CCard className="mb-3">
        <CCardBody>
          <CForm onSubmit={handleSearch}>
            <CRow className="mb-3">
              <CCol md={4}>
                <CFormInput label="회사명" name="companyName" value={filter.companyName} onChange={handleChange} />
              </CCol>
              <CCol md={4}>
                <CFormInput label="사업자번호" name="bizNo" value={filter.bizNo} onChange={handleChange} />
              </CCol>
              <CCol md={4}>
                <CFormInput label="전화번호" name="telNo" value={filter.telNo} onChange={handleChange} />
              </CCol>
            </CRow>
            <div className="d-flex justify-content-end">
              <CButton type="submit" color="primary">조회</CButton>
            </div>
          </CForm>
        </CCardBody>
      </CCard>

      {/* 📋 목록영역 */}
      <CCard>
        <CCardBody>
          <div className="d-flex justify-content-end mb-3">
            <CButton color="success" onClick={() => navigate('/system/company/new')}>
              신규 등록
            </CButton>
          </div>

          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>회사명</CTableHeaderCell>
                <CTableHeaderCell>사업자번호</CTableHeaderCell>
                <CTableHeaderCell>전화번호</CTableHeaderCell>
                <CTableHeaderCell>주소</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {list.map((item) => (
                <CTableRow
                  key={item.companySeq}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/system/company/${item.companySeq}`)}
                >
                  <CTableDataCell>{item.companyName}</CTableDataCell>
                  <CTableDataCell>{item.bizNo}</CTableDataCell>
                  <CTableDataCell>{item.telNo}</CTableDataCell>
                  <CTableDataCell>{item.address}</CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </>
  )
}

export default CompanyList

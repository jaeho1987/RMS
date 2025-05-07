import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CForm,
  CFormInput,
  CFormTextarea,
  CRow,
} from '@coreui/react'
import { useNavigate, useParams } from 'react-router-dom'
import axiosInstance from 'src/api/axiosInstance'
import { normalizeObject } from 'src/utils/common'

const CompanyForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    companyName: '',
    bizNo: '',
    bizType: '',
    bizCondition: '',
    telNo: '',
    email: '',
    zipCode: '',
    address: '',
    description: '',
    regId: 'admin',
  })

  const isEdit = !!id
  const cleanedBizNo = form.bizNo.replace(/[^0-9]/g, '')

  useEffect(() => {
    if (isEdit) {
      axiosInstance.get(`/api/system/companies/${id}`).then((res) => setForm(normalizeObject(res.data)))
    }
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    const cleaned = name === 'bizNo' ? value.replace(/[^0-9\-]/g, '') : value
    setForm((prev) => ({ ...prev, [name]: cleaned }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitted(true)

    const isValid = form.companyName.trim() && cleanedBizNo.length === 10
    if (!isValid) return

    try {
      if (isEdit) {
        await axiosInstance.put(`/api/system/companies/${id}`, { ...form, bizNo: cleanedBizNo })
        alert('수정이 완료되었습니다.')
      } else {
        const res = await axiosInstance.post('/api/system/companies', { ...form, bizNo: cleanedBizNo })
        const companySeq = res.data.companySeq
        alert('등록이 완료되었습니다.')
        navigate(`/system/company/${companySeq}`)
        return
      }
    } catch (err) {
      console.error(err)
      alert('저장 실패')
    }
  }

  return (
    <CCard>
      <CCardBody>
        <h5 className="mb-4">회사 {isEdit ? '수정' : '등록'}</h5>
        <CForm noValidate onSubmit={handleSubmit}>
          <CRow className="mb-3">
            <CCol md={6}>
              <CFormInput
                label="회사명 *"
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                required
                invalid={submitted && !form.companyName.trim()}
                feedbackInvalid="회사명은 필수입니다."
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                label="사업자번호 *"
                name="bizNo"
                value={form.bizNo}
                onChange={handleChange}
                required
                invalid={submitted && cleanedBizNo.length !== 10}
                feedbackInvalid={
                  cleanedBizNo.length === 0
                    ? '사업자번호는 필수입니다.'
                    : cleanedBizNo.length < 10
                      ? '사업자번호가 너무 짧습니다 (10자리).'
                      : '사업자번호가 너무 깁니다 (10자리까지만 입력하세요).'
                }
              />
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol md={6}>
              <CFormInput label="업종" name="bizType" value={form.bizType} onChange={handleChange} />
            </CCol>
            <CCol md={6}>
              <CFormInput label="업태" name="bizCondition" value={form.bizCondition} onChange={handleChange} />
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol md={6}>
              <CFormInput label="전화번호" name="telNo" value={form.telNo} onChange={handleChange} />
            </CCol>
            <CCol md={6}>
              <CFormInput label="이메일" name="email" type="email" value={form.email} onChange={handleChange} />
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol md={6}>
              <CFormInput label="우편번호" name="zipCode" value={form.zipCode} onChange={handleChange} />
            </CCol>
            <CCol md={6}>
              <CFormInput label="주소" name="address" value={form.address} onChange={handleChange} />
            </CCol>
          </CRow>

          <CRow className="mb-4">
            <CCol>
              <CFormTextarea label="설명" name="description" value={form.description} onChange={handleChange} />
            </CCol>
          </CRow>

          <div className="d-flex justify-content-end gap-2">
            <CButton type="button" color="secondary" onClick={() => navigate('/system/company')}>
              목록
            </CButton>
            <CButton type="submit" color="primary">
              저장
            </CButton>
          </div>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default CompanyForm

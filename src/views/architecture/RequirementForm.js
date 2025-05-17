import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CForm,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CRow,
} from '@coreui/react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axiosInstance from 'src/api/axiosInstance'
import { normalizeObject, getCodeOptions } from 'src/utils/common'
import TestcaseTreeGrid from './TestcaseTreeGrid'

const RequirementForm = () => {
  const navigate = useNavigate()
  const { seq } = useParams()
  const codeMap = useSelector(state => state.codeMap)

  const [reqSeq, setReqSeq] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  const [form, setForm] = useState({
    reqId: '',
    reqName: '',
    reqDesc: '',
    reqTypeCode: '',
    priorityCode: '',
    statusCode: '',
    ownerId: '',
  })

  useEffect(() => {
    if (seq) {
      axiosInstance.get(`/api/requirement/${seq}`).then((res) => {
        const data = normalizeObject(res.data)
        setForm({
          reqId: data.reqId,
          reqName: data.reqName,
          reqDesc: data.reqDesc,
          reqTypeCode: data.reqTypeCode,
          priorityCode: data.priorityCode,
          statusCode: data.statusCode,
          ownerId: data.ownerId,
        })
        setReqSeq(data.reqSeq)
      })
    }
  }, [seq])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitted(true)

    if (!form.reqId.trim() || !form.reqName.trim()) return

    try {
      await axiosInstance.put(`/api/requirement/${reqSeq}`, form)
      alert('저장되었습니다.')
    } catch (err) {
      console.error(err)
      alert('저장에 실패했습니다.')
    }
  }

  const buildOptions = (group) => [
    { label: '선택하세요', value: '' },
    ...getCodeOptions(codeMap, group).map(c => ({
      label: c.value,
      value: c.id,
    })),
  ]

  return (
    <>
      <CCard>
        <CCardBody>
          <h5 className="mb-4">요구사항 수정</h5>
          <CForm noValidate onSubmit={handleSubmit}>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormInput
                  label="요구사항 ID *"
                  name="reqId"
                  value={form.reqId}
                  onChange={handleChange}
                  required
                  invalid={submitted && !form.reqId.trim()}
                  feedbackInvalid="요구사항 ID는 필수입니다."
                />
              </CCol>
              <CCol md={6}>
                <CFormInput
                  label="요구사항 명 *"
                  name="reqName"
                  value={form.reqName}
                  onChange={handleChange}
                  required
                  invalid={submitted && !form.reqName.trim()}
                  feedbackInvalid="요구사항 명은 필수입니다."
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormSelect
                  label="요구사항 유형"
                  name="reqTypeCode"
                  value={form.reqTypeCode}
                  onChange={handleChange}
                  options={buildOptions('REQ_TYPE')}
                />
              </CCol>
              <CCol md={6}>
                <CFormSelect
                  label="우선순위"
                  name="priorityCode"
                  value={form.priorityCode}
                  onChange={handleChange}
                  options={buildOptions('REQ_PRIORITY')}
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormSelect
                  label="상태"
                  name="statusCode"
                  value={form.statusCode}
                  onChange={handleChange}
                  options={buildOptions('REQ_STATUS')}
                />
              </CCol>
              <CCol md={6}>
                <CFormInput
                  label="담당자 ID"
                  name="ownerId"
                  value={form.ownerId}
                  onChange={handleChange}
                />
              </CCol>
            </CRow>

            <CRow className="mb-4">
              <CCol>
                <CFormTextarea
                  label="요구사항 설명"
                  name="reqDesc"
                  value={form.reqDesc}
                  onChange={handleChange}
                  rows={4}
                />
              </CCol>
            </CRow>

            <div className="d-flex justify-content-end gap-2">
              <CButton type="button" color="secondary" onClick={() => navigate('/requirements/requirementList')}>
                목록
              </CButton>
              <CButton type="submit" color="primary">
                저장
              </CButton>
            </div>
          </CForm>
        </CCardBody>
      </CCard>

      {/* 테스트케이스 트리그리드 */}
      {reqSeq && <TestcaseTreeGrid reqSeq={reqSeq} />}
    </>
  )
}

export default RequirementForm

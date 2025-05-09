import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCol,
  CForm,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CRow,
  CButton,
} from '@coreui/react'
import { useNavigate, useParams } from 'react-router-dom'
import axiosInstance from 'src/api/axiosInstance'
import { normalizeObject } from 'src/utils/common'

const BizCodeForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const [form, setForm] = useState({
    name: '',
    description: '',
    levelNo: 1,
    parentSeq: null,
    regId: 'admin',
  })

  const [allItems, setAllItems] = useState([])
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    axiosInstance.get('/api/biz-code').then((res) => setAllItems(res.data))

    if (isEdit) {
      axiosInstance.get(`/api/biz-code/${id}`).then((res) => {
        setForm(normalizeObject(res.data))
      })
    }
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitted(true)

    if (!form.name?.trim() || !form.levelNo) return

    try {
      if (isEdit) {
        await axiosInstance.put(`/api/biz-code/${id}`, form)
        alert('수정이 완료되었습니다.')
      } else {
        const res = await axiosInstance.post('/api/biz-code', form)
        const newId = res.data?.bizSeq ?? id
        alert('등록이 완료되었습니다.')
        navigate(`/architecture/biz-code/${newId}`)
        return
      }
      navigate('/architecture/biz-code')
    } catch (err) {
      console.error(err)
      alert('저장 실패')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return
    try {
      await axiosInstance.delete(`/api/biz-code/${id}`)
      alert('삭제 완료')
      navigate('/architecture/biz-code')
    } catch (err) {
      const msg =
        err.response?.data?.message || '하위 항목이 있거나 삭제에 실패했습니다.'
      alert(msg)
    }
  }


  const level = parseInt(form.levelNo)
  const filteredParents = allItems.filter((item) => parseInt(item.levelNo) < level)

  return (
    <CCard>
      <CCardBody>
        <h5 className="mb-4">계층코드 {isEdit ? '수정' : '등록'}</h5>
        <CForm onSubmit={handleSubmit}>
          <CRow className="mb-3">
            <CCol md={6}>
              <CFormInput
                label="항목명 *"
                name="name"
                value={form.name ?? ''}
                onChange={handleChange}
                required
                invalid={submitted && !form.name?.trim()}
                feedbackInvalid="항목명은 필수입니다."
              />
            </CCol>
            <CCol md={6}>
              <CFormSelect
                label="레벨 *"
                name="levelNo"
                value={form.levelNo}
                onChange={handleChange}
                options={[
                  { label: '도메인 (1)', value: 1 },
                  { label: '그룹 (2)', value: 2 },
                  { label: '시스템 (3)', value: 3 },
                ]}
              />
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol md={6}>
              <CFormSelect
                label="상위 항목"
                name="parentSeq"
                value={form.parentSeq ?? ''}
                onChange={handleChange}
                disabled={level === 1}
              >
                <option value="">(최상위)</option>
                {filteredParents.map((item) => (
                  <option key={item.bizSeq} value={item.bizSeq}>
                    {item.name}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
          </CRow>

          <CRow className="mb-4">
            <CCol>
              <CFormTextarea
                label="설명"
                name="description"
                value={form.description ?? ''}
                onChange={handleChange}
              />
            </CCol>
          </CRow>

          <div className="d-flex justify-content-end gap-2">
            <CButton color="secondary" onClick={() => navigate('/architecture/biz-code')}>
              목록
            </CButton>
            {isEdit && (
              <CButton color="danger" onClick={handleDelete}>
                삭제
              </CButton>
            )}
            <CButton type="submit" color="primary">
              저장
            </CButton>
          </div>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default BizCodeForm

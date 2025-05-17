import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CButton, CCard, CCardBody, CCol, CForm, CFormInput, CRow } from '@coreui/react';
import axiosInstance from 'src/api/axiosInstance';
import { normalizeObject } from 'src/utils/common';

const UserForm = () => {
  const { id } = useParams();  // URL에서 'id' 파라미터 추출
  const navigate = useNavigate();
  const [form, setForm] = useState({
    userName: '',
    email: '',
    role: 'USER',
    companySeq: '',
  });
  const [submitted, setSubmitted] = useState(false);

  // 'new'일 경우, 새로운 사용자 등록을 위해 기본 폼을 렌더링
  const isEdit = !!id

  useEffect(() => {
    if (isEdit) {
      // 기존 사용자 상세 정보 조회 (수정 화면)
      axiosInstance.get(`/api/users/${id}`).then((res) => {
        setForm(normalizeObject(res.data));  // 응답 데이터를 폼에 설정
      }).catch((error) => {
        console.error('사용자 정보 조회 실패', error);
        alert('사용자 정보를 불러오는 데 실패했습니다.');
      });
    }
  }, [id]);

  // 폼 값 변경 처리
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 폼 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    // 필수 필드 검사
    if (!form.userName.trim() || !form.email.trim()) {
      return alert('사용자명과 이메일은 필수입니다.');
    }

    try {
      if (isEdit) {
        // 수정 요청
        await axiosInstance.put(`/api/users/${id}`, form);
        alert('수정이 완료되었습니다.');
      } else {
        // 새 사용자 등록 요청
        const res = await axiosInstance.post('/api/users', form);
        alert('사용자 등록이 완료되었습니다.');
        navigate(`/system/userForm/${res.data.result.userId}`);  // 새 사용자 상세 화면으로 이동
      }
    } catch (error) {
      console.error('저장 실패', error);
      alert('저장에 실패했습니다.');
    }
  };

  return (
    <CCard>
      <CCardBody>
        <h5 className="mb-4">{isEdit ? '사용자 정보 수정' : '새 사용자 등록'}</h5>
        <CForm noValidate onSubmit={handleSubmit}>
          <CRow className="mb-3">
            <CCol md={6}>
              <CFormInput
                label="사용자명 *"
                name="userName"
                value={form.userName}
                onChange={handleChange}
                required
                invalid={submitted && !form.userName.trim()}
                feedbackInvalid="사용자명은 필수입니다."
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                label="이메일 *"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                invalid={submitted && !form.email.trim()}
                feedbackInvalid="이메일은 필수입니다."
              />
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol md={6}>
              <CFormInput
                label="역할"
                name="role"
                value={form.role}
                onChange={handleChange}
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                label="회사"
                name="companySeq"
                value={form.companySeq}
                onChange={handleChange}
              />
            </CCol>
          </CRow>

          <div className="d-flex justify-content-end gap-2">
            <CButton type="button" color="secondary" onClick={() => navigate('/system/userList')}>
              목록
            </CButton>
            <CButton type="submit" color="primary">
              저장
            </CButton>
          </div>
        </CForm>
      </CCardBody>
    </CCard>
  );
};

export default UserForm;

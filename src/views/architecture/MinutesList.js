import React, { useEffect, useRef, useState } from 'react'
import {
  CCard, CCardBody, CRow, CCol, CFormInput, CForm, CButton
} from '@coreui/react'
import axios from 'src/api/axiosInstance'
import useSelectedSystem from 'src/hooks/useSelectedSystem'
import SystemSelectModal from './SystemSelectModal'
import store from 'src/store'

const MinutesList = () => {
  const { system, systemRef, updateSystem } = useSelectedSystem()
  const [showPopup, setShowPopup] = useState(false)
  const vaultRef = useRef(null)

  useEffect(() => {
    if (system?.bizSeq) {
      fetchFileList()
    }
  }, [system])

  const fetchFileList = () => {
    const selected = systemRef.current
    if (!selected?.bizSeq) {
      alert('시스템을 선택하세요')
      return
    }

    axios.get('/api/fileInfo', {
      params: {
        refSeq: selected.bizSeq,
        fileType: 'MEETING'
      }
    }).then(res => {
      initVault(selected.bizSeq, res.data.result)
    })
  }

  const initVault = (refSeq, files = []) => {
    if (vaultRef.current) {
      vaultRef.current.destructor()
    }

    const token = store.getState().accessToken

    vaultRef.current = new dhx.Vault("vault_container", {
      uploader: {
        target: '/api/fileInfo/upload',
        autosend: true,
        headerParams: {
          Authorization: `Bearer ${token}`
        },
        params: {
          refSeq: refSeq,
          fileType: 'MEETING'
        }
      },
      toolbar: true
    })

    // ✅ Vault에 파일 데이터 수동 주입
    vaultRef.current.data.parse(files.map(file => ({
      id: file.fileSeq,
      name: file.originalName,
      size: file.fileSize,
      status: "uploaded",
      link: file.fileSeq.toString() // 버튼 생성을 위한 dummy 링크
    })))

    // ✅ 파일 삭제 처리
    vaultRef.current.events.on("BeforeFileRemove", (id) => {
      return axios.delete(`/api/fileInfo/${id}`)
        .then(res => res.data.success)
        .catch(() => false)
    })

    // ✅ 다운로드 버튼 DOM에 직접 이벤트 바인딩
    setTimeout(() => {
      const anchors = document.querySelectorAll(
        ".dhx_item--download-btn, .dhx_dataview-item--download-btn"
      )

      anchors.forEach(anchor => {
        anchor.addEventListener("click", async (e) => {
          e.preventDefault()
          const fileId = anchor.getAttribute("download")
          try {
            const res = await fetch(`/api/fileInfo/download/${fileId}`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            })

            if (!res.ok) {
              alert("다운로드 실패")
              return
            }

            const blob = await res.blob()
            const disposition = res.headers.get("Content-Disposition")
            const filename = getFilenameFromDisposition(disposition)

            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = filename
            document.body.appendChild(a)
            a.click()
            a.remove()
            window.URL.revokeObjectURL(url)
          } catch (err) {
            console.error("다운로드 중 오류 발생", err)
          }
        })
      })
    }, 500)
  }

  const getFilenameFromDisposition = (disposition) => {
    const match = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition)
    if (match != null && match[1]) {
      return decodeURIComponent(match[1].replace(/['"]/g, ''))
    }
    return "downloaded.file"
  }

  const handleUpdateSystem = (system) => {
    updateSystem(system)
    setShowPopup(false)
  }

  return (
    <>
      <CCard className="mb-3">
        <CCardBody>
          <CForm onSubmit={(e) => { e.preventDefault(); fetchFileList() }}>
            <CRow>
              <CCol md={6}>
                <CFormInput
                  label="시스템"
                  value={system?.systemName || ''}
                  onClick={() => setShowPopup(true)}
                  readOnly
                  placeholder="시스템을 선택하세요"
                />
              </CCol>
              <CCol md={6} className="d-flex align-items-end justify-content-end">
                <CButton type="submit" color="primary">조회</CButton>
              </CCol>
            </CRow>
          </CForm>
        </CCardBody>
      </CCard>

      <CCard>
        <CCardBody style={{ height: '500px' }}>
          <div id="vault_container" style={{ height: '100%' }} />
        </CCardBody>
      </CCard>

      <SystemSelectModal
        visible={showPopup}
        onClose={() => setShowPopup(false)}
        updateSystem={handleUpdateSystem}
      />
    </>
  )
}

export default MinutesList

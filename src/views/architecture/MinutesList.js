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
  const token = store.getState().accessToken

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
      toolbar: true,
      actions: {
        upload: true,
        download: true,
        delete: true
      },
    })

    const dataset = files.map(file => ({
      id: file.fileSeq,
      name: file.originalName,
      status: "uploaded",
      size: file.fileSize,
      link: file.fileSeq.toString()
    }))

    vaultRef.current.data.parse(dataset)

    vaultRef.current.events.on("BeforeRemove", (file) => {
      return axios.delete(`/api/fileInfo/${file.id}`) // ✅ 여기가 핵심!
        .then(res => res.data.success)
        .catch(() => false)
    })
    setTimeout(() => {
      document.querySelectorAll(".dhx_toolbar-button").forEach((btn) => {
        btn.addEventListener("click", () => {
          bindDownloadEventHandlers()
        });
      });
    }, 500); // 시간 늘려보기

    // ✅ 초기 바인딩
    bindDownloadEventHandlers()
  }

  // ✅ 다운로드 수동 구현 함수
  const bindDownloadEventHandlers = () => {
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

  // ✅ 파일 이름 추출
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

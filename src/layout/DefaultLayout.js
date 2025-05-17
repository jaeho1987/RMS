import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'
import RestoreTopMenu from '../components/RestoreTopMenu'
import axios from 'src/api/axiosInstance' // ✅ axiosInstance import

const DefaultLayout = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    // ✅ 메뉴 로딩 (axios로 변경)
    axios
      .get('/api/menus', { withCredentials: true }) // 쿠키 필요 시 포함
      .then((res) => {
        const data = res.data
        dispatch({ type: 'set', menuList: data })

        const topMenus = data.filter((m) => m.parentSeq === null)
        const savedTopMenu = localStorage.getItem('topMenu')

        if (!savedTopMenu && topMenus.length > 0) {
          dispatch({ type: 'set', topMenu: topMenus[0].menuSeq })
        }
      })
      .catch((err) => {
        console.error('메뉴 로딩 실패:', err)
      })

    // ✅ 공통코드 로딩
    axios
      .get('/api/common-code/common-codes', { withCredentials: true })
      .then((res) => {
        dispatch({ type: 'set', codeMap: res.data })
      })
      .catch((err) => {
        console.error('공통코드 로딩 실패:', err)
      })
  }, [dispatch])

  return (
    <div>
      <RestoreTopMenu />
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <AppContent />
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default DefaultLayout

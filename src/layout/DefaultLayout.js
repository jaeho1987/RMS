import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'
import RestoreTopMenu from '../components/RestoreTopMenu'

const DefaultLayout = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    // ✅ 메뉴 로딩
    fetch('/api/menus', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        dispatch({ type: 'set', menuList: data })

        const topMenus = data.filter((m) => m.parentSeq === null)
        const savedTopMenu = localStorage.getItem('topMenu')

        if (!savedTopMenu && topMenus.length > 0) {
          dispatch({ type: 'set', topMenu: topMenus[0].menuSeq })
        }
      })

    // ✅ 공통코드 로딩
    fetch('/api/common-code/common-codes', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        dispatch({ type: 'set', codeMap: data }) // ✅ 전역 상태에 저장
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

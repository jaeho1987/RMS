import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'
import RestoreTopMenu from '../components/RestoreTopMenu' // ✅ import 추가

const DefaultLayout = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    fetch('/api/menus', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        dispatch({ type: 'set', menuList: data })

        const topMenus = data.filter((m) => m.parentSeq === null)
        const savedTopMenu = localStorage.getItem('topMenu')

        if (!savedTopMenu && topMenus.length > 0) {
          dispatch({ type: 'set', topMenu: topMenus[0].menuSeq }) // ✅ localStorage 없을 때만 설정
        }
      })
  }, [dispatch])

  return (
    <div>
      <RestoreTopMenu /> {/* ✅ topMenu 복원용 */}
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

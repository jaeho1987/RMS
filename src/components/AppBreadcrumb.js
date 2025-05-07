import React from 'react'
import { useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { CBreadcrumb, CBreadcrumbItem } from '@coreui/react'

const AppBreadcrumb = () => {
  const location = useLocation()
  const menuList = useSelector((state) => state.menuList)

  // 현재 경로와 가장 잘 맞는 메뉴 찾기 (길이가 가장 긴 prefix 기준)
  const findCurrentMenu = (path) => {
    return menuList
      .filter((m) => path.startsWith(m.menuPath || ''))
      .sort((a, b) => (b.menuPath?.length || 0) - (a.menuPath?.length || 0))[0]
  }

  // 상위 메뉴들을 역으로 추적해서 Breadcrumb 구성
  const buildBreadcrumbTrail = (menu) => {
    const trail = []
    let current = menu

    while (current) {
      trail.unshift(current)
      current = menuList.find((m) => m.menuSeq === current.parentSeq)
    }

    return trail
  }

  const currentMenu = findCurrentMenu(location.pathname)
  const breadcrumbTrail = currentMenu ? buildBreadcrumbTrail(currentMenu) : []

  return (
    <CBreadcrumb className="m-0 ms-2">
      {breadcrumbTrail.map((menu) => (
        <CBreadcrumbItem key={menu.menuSeq}>
          {menu.menuName}
        </CBreadcrumbItem>
      ))}
    </CBreadcrumb>
  )
}

export default AppBreadcrumb

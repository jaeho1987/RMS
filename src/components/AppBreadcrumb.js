import React from 'react'
import { useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { CBreadcrumb, CBreadcrumbItem } from '@coreui/react'

const AppBreadcrumb = () => {
  const location = useLocation()
  const menuList = useSelector((state) => state.menuList)

  // 현재 경로로 매칭되는 메뉴 찾기
  const findCurrentMenu = (path) => {
    return menuList.find((m) => m.menuPath === path)
  }

  // 상위 메뉴들을 재귀적으로 추적
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
        <CBreadcrumbItem key={menu.menuSeq}>{menu.menuName}</CBreadcrumbItem>
      ))}
    </CBreadcrumb>
  )
}

export default AppBreadcrumb

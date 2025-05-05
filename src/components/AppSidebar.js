import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarHeader,
  CSidebarNav,
  CNavItem,
  CNavGroup,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { AppSidebarNav } from './AppSidebarNav'
import { logo } from 'src/assets/brand/logo'
import { sygnet } from 'src/assets/brand/sygnet'

// ✅ 정확한 아이콘만 개별 import
import {
  cilPuzzle,
  cilBell,
  cilCalculator,
  cilChartLine,
  cilList,
  cilCursor,
  cilDrop,
  cilText,
  cilNotes,
  cilInput,
  cilInputPower,
  cilCheck,
  cilCheckCircle,
  cilOptions,
  cilGrid,
  cilWarning,
  cilBadge,
  cilWindowMaximize,
  cilFlagAlt,
  cilStar,
} from '@coreui/icons'

const iconMap = {
  'cil-puzzle': cilPuzzle,
  'cil-bell': cilBell,
  'cil-calculator': cilCalculator,
  'cil-chart-line': cilChartLine,
  'cil-list': cilList,
  'cil-cursor': cilCursor,
  'cil-drop': cilDrop,
  'cil-text': cilText,
  'cil-notes': cilNotes,
  'cil-input': cilInput,
  'cil-input-power': cilInputPower,
  'cil-check': cilCheck,
  'cil-check-circle': cilCheckCircle,
  'cil-options': cilOptions,  // ✅ cil-slider → cil-options
  'cil-grid': cilGrid,
  'cil-warning': cilWarning,
  'cil-badge': cilBadge,
  'cil-window-maximize': cilWindowMaximize,
  'cil-flag-alt': cilFlagAlt,
  'cil-star': cilStar,
}

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const menuList = useSelector((state) => state.menuList)
  const topMenu = useSelector((state) => state.topMenu)

  const filteredMenus = menuList.filter((m) => m.parentSeq === topMenu)

  const buildMenuTree = (list) => {
    const map = {}
    const roots = []

    list.forEach((item) => {
      map[item.menuSeq] = { ...item, children: [] }
    })

    list.forEach((item) => {
      if (item.parentSeq && map[item.parentSeq]) {
        map[item.parentSeq].children.push(map[item.menuSeq])
      } else {
        roots.push(map[item.menuSeq])
      }
    })

    return roots
  }

  const convertToNavFormat = (treeList) => {
    return treeList.map((item) => {
      let icon = null
      if (item.menuIcon && iconMap[item.menuIcon]) {
        icon = <CIcon icon={iconMap[item.menuIcon]} customClassName="nav-icon" />
      }

      const children =
        item.children && item.children.length > 0
          ? convertToNavFormat(item.children)
          : [
            {
              component: CNavItem,
              name: item.menuName,
              to: item.menuPath,
              icon,
            },
          ]

      return {
        component: CNavGroup,
        name: item.menuName,
        icon,
        to: undefined,
        items: children,
      }
    })
  }

  const tree = buildMenuTree(filteredMenus)
  const menuItems = convertToNavFormat(tree)

  return (
    <CSidebar
      className="border-end"
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
    >
      <CSidebarHeader className="border-bottom">
        <CSidebarBrand to="/">
          <CIcon customClassName="sidebar-brand-full" icon={logo} height={32} />
          <CIcon customClassName="sidebar-brand-narrow" icon={sygnet} height={32} />
        </CSidebarBrand>
        <CCloseButton
          className="d-lg-none"
          dark
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </CSidebarHeader>

      <CSidebarNav>
        <AppSidebarNav items={menuItems} />
      </CSidebarNav>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)

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

// 아이콘 import
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
  'cil-options': cilOptions,
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
      const icon = item.menuIcon && iconMap[item.menuIcon]
        ? <CIcon icon={iconMap[item.menuIcon]} customClassName="nav-icon" />
        : null

      if (Array.isArray(item.children) && item.children.length > 0) {
        return {
          component: CNavGroup,
          name: item.menuName,
          icon,
          items: convertToNavFormat(item.children),
        }
      } else {
        return {
          component: CNavItem,
          name: item.menuName,
          icon,
          to: item.menuPath,
        }
      }
    })
  }

  const fullTree = buildMenuTree(menuList)
  const topNode = fullTree.find((m) => m.menuSeq === topMenu)
  const menuItems = convertToNavFormat(topNode?.children || [])

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

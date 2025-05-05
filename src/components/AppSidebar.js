import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  // CSidebarFooter,
  CSidebarHeader,
  CSidebarNav,
  // CSidebarToggler,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import * as iconSet from '@coreui/icons'
import { CNavItem, CNavGroup } from '@coreui/react'
import { AppSidebarNav } from './AppSidebarNav'
import { logo } from 'src/assets/brand/logo'
import { sygnet } from 'src/assets/brand/sygnet'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const [menuItems, setMenuItems] = useState([])

  useEffect(() => {
    fetch('/api/menus', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        const tree = buildMenuTree(data)
        const nav = convertToNavFormat(tree)
        setMenuItems(nav)
      })
  }, [])

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
      const icon = item.menuIcon ? (
        <CIcon icon={iconSet[item.menuIcon]} customClassName="nav-icon" />
      ) : undefined

      if (item.children.length > 0) {
        return {
          component: CNavGroup,
          name: item.menuName,
          icon,
          to: item.menuPath || undefined,
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

      {/*<CSidebarFooter className="border-top d-none d-lg-flex">*/}
      {/*  <CSidebarToggler*/}
      {/*    onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}*/}
      {/*  />*/}
      {/*</CSidebarFooter>*/}
    </CSidebar>
  )
}

export default React.memo(AppSidebar)

import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'

import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'

import { CBadge, CNavLink, CSidebarNav } from '@coreui/react'

export const AppSidebarNav = ({ items }) => {
  const location = useLocation()

  const navLink = (name, icon, badge, indent = false) => (
    <>
      {icon
        ? icon
        : indent && (
        <span className="nav-icon">
              <span className="nav-icon-bullet"></span>
            </span>
      )}
      {name}
      {badge && (
        <CBadge color={badge.color} className="ms-auto" size="sm">
          {badge.text}
        </CBadge>
      )}
    </>
  )

  const navItem = (item, index, indent = false) => {
    const { component, name, badge, icon, to, href, ...rest } = item
    const Component = component

    return (
      <Component as="li" key={index}>
        {to || href ? (
          <CNavLink
            as={NavLink}
            to={to}
            end={false} // ✅ 하위 경로도 active 처리
            className={({ isActive }) =>
              `nav-link${isActive ? ' active' : ''}`
            }
            {...(href && { target: '_blank', rel: 'noopener noreferrer' })}
            {...rest}
          >
            {navLink(name, icon, badge, indent)}
          </CNavLink>
        ) : (
          <span className="nav-link">{navLink(name, icon, badge, indent)}</span>
        )}
      </Component>
    )
  }

  const isActivePathInGroup = (items) => {
    return items?.some((child) => {
      if (child.to && location.pathname.startsWith(child.to)) return true
      if (child.items) return isActivePathInGroup(child.items)
      return false
    })
  }

  const navGroup = (item, index) => {
    const { component, name, icon, items } = item
    const Component = component

    const isOpen = isActivePathInGroup(items)

    return (
      <Component
        as="li"
        key={index}
        toggler={navLink(name, icon)}
        visible={isOpen} // ✅ 자동 펼침
      >
        {items?.map((child, childIndex) =>
          child.items
            ? navGroup(child, childIndex)
            : navItem(child, childIndex, true)
        )}
      </Component>
    )
  }

  return (
    <CSidebarNav as={SimpleBar}>
      {items?.map((item, index) =>
        item.items ? navGroup(item, index) : navItem(item, index)
      )}
    </CSidebarNav>
  )
}

AppSidebarNav.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
}

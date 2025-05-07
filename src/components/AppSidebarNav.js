import React from 'react'
import { NavLink } from 'react-router-dom'
import PropTypes from 'prop-types'

import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'

import { CBadge, CNavLink, CSidebarNav } from '@coreui/react'

export const AppSidebarNav = ({ items }) => {
  const navLink = (name, icon, badge, indent = false) => {
    return (
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
  }

  const navItem = (item, index, indent = false) => {
    const { component, name, badge, icon, to, href, ...rest } = item
    const Component = component

    return (
      <Component as="li" key={index}>
        {to || href ? (
          <CNavLink
            as={NavLink}
            to={to}
            end={false}
            className="nav-link"
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

  const navGroup = (item, index) => {
    const { component, name, icon, items } = item
    const Component = component

    return (
      <Component as="li" key={index} toggler={navLink(name, icon)}>
        {items?.map((child, childIndex) =>
          child.items ? navGroup(child, childIndex) : navItem(child, childIndex, true),
        )}
      </Component>
    )
  }

  return (
    <CSidebarNav as={SimpleBar}>
      {items?.map((item, index) => (item.items ? navGroup(item, index) : navItem(item, index)))}
    </CSidebarNav>
  )
}

AppSidebarNav.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
}

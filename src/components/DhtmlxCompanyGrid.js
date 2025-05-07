import React, { useEffect, useRef } from 'react'
import { Grid, setTheme } from 'dhx-suite'
import 'dhx-suite/codebase/suite.min.css'

const DhtmlxCompanyGrid = ({ data = [], config = {}, onRowClick }) => {
  const gridRef = useRef(null)
  const grid = useRef(null)

  const {
    columns = [],
    height = 400,
    autoWidth = true,
    resizable = true,
  } = config

  const getCoreUITheme = () =>
    document.documentElement.getAttribute('data-coreui-theme') || 'light'

  const applyGrid = () => {
    const currentTheme = getCoreUITheme()
    setTheme(currentTheme)

    if (grid.current) {
      grid.current.destructor()
      grid.current = null
    }

    if (gridRef.current) gridRef.current.innerHTML = ''

    grid.current = new Grid(gridRef.current, {
      columns,
      autoWidth,
      height,
      resizable,
    })

    if (onRowClick) {
      grid.current.events.on('cellClick', onRowClick)
    }

    grid.current.data.parse(data)
  }

  useEffect(() => {
    applyGrid()

    const observer = new MutationObserver(applyGrid)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-coreui-theme'],
    })

    return () => {
      observer.disconnect()
      grid.current?.destructor()
    }
  }, [data, config]) // theme은 내부 감지 → dependency 불필요

  return <div ref={gridRef} />
}

export default DhtmlxCompanyGrid

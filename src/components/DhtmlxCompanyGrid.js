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
    resizable = true,       // ✅ 기본값 true로 설정
    theme = 'light',
  } = config

  const applyGrid = () => {
    setTheme(theme)

    if (grid.current) {
      grid.current.destructor()
      grid.current = null
    }

    if (gridRef.current) gridRef.current.innerHTML = ''

    grid.current = new Grid(gridRef.current, {
      columns,
      autoWidth,
      height,
      resizable, // ✅ 사용자 컬럼 사이즈 조절 허용 여부
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
  }, [data, config])

  return <div ref={gridRef} />
}

export default DhtmlxCompanyGrid

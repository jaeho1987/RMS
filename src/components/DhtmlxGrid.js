import React, { useEffect, useRef } from 'react'
import { Grid, setTheme } from 'dhx-suite'
import PropTypes from 'prop-types'
import 'dhx-suite/codebase/suite.min.css'

const DhtmlxGrid = ({ data = [], config = {}, onRowClick, onRowDblClick }) => {
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
    if (onRowDblClick) {
      grid.current.events.on('cellDblClick', onRowDblClick)
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

DhtmlxGrid.propTypes = {
  data: PropTypes.array,
  config: PropTypes.object,
  onRowClick: PropTypes.func,
  onRowDblClick: PropTypes.func,
}

export default DhtmlxGrid

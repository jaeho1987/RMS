import React from 'react'
import { useSelector } from 'react-redux'
import { CSpinner } from '@coreui/react'

const AppSpinner = () => {
  const loading = useSelector((state) => state.loading)

  if (!loading) return null

  return (
    <div style={{
      position: 'fixed',
      zIndex: 9999,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <CSpinner color="secondary" size="xl" />
    </div>
  )
}

export default AppSpinner

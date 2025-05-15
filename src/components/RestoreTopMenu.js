import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const RestoreTopMenu = () => {
  const dispatch = useDispatch()
  const topMenu = useSelector((state) => state.topMenu)

  useEffect(() => {
    const saved = localStorage.getItem('topMenu')
    if (saved && !topMenu) {
      dispatch({ type: 'set', topMenu: parseInt(saved) })
    }
  }, [])

  return null
}

export default RestoreTopMenu

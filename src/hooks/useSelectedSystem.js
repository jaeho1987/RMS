import { useSelector, useDispatch } from 'react-redux'
import { useRef, useEffect } from 'react'

const useSelectedSystem = () => {
  const dispatch = useDispatch()
  const selectedSystem = useSelector((state) => state.selectedSystem)
  const systemRef = useRef(null)

  useEffect(() => {
    if (selectedSystem) {
      systemRef.current = selectedSystem
    }
  }, [selectedSystem])

  const updateSystem = (system) => {
    dispatch({ type: 'set', selectedSystem: system })
    localStorage.setItem('selectedSystem', JSON.stringify(system))
    systemRef.current = system
  }

  return {
    system: selectedSystem,
    systemRef,
    updateSystem
  }
}

export default useSelectedSystem

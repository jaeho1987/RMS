import React, { Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux' // ✅ 추가
import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'
import './scss/examples.scss'
import './utils/common.js'
import axiosInstance from 'src/api/axiosInstance' // ✅ refresh 호출할 axios 인스턴스

// Spinner
import AppSpinner from 'src/components/AppSpinner'

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)
  const dispatch = useDispatch() // ✅ Redux 상태 업데이트용

  useEffect(() => {
    // ✅ 시스템 정보 복원
    const savedSystem = localStorage.getItem('selectedSystem')
    if (savedSystem) {
      dispatch({ type: 'set', selectedSystem: JSON.parse(savedSystem) })
    }

    // ✅ 테마 복원
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
    if (theme) {
      setColorMode(theme)
    }

    if (!isColorModeSet()) {
      setColorMode(storedTheme)
    }

    // ✅ access token 자동 복원
    const tryRefreshToken = async () => {
      try {
        const res = await axiosInstance.get('/api/auth/refresh', { withCredentials: true })
        const newAccessToken = res.data.accessToken

        dispatch({ type: 'set', accessToken: newAccessToken })
        // 👉 이후 axiosInstance interceptor에서 이 토큰을 사용하게 됨
      } catch (e) {
        console.warn('앱 시작 시 access token 갱신 실패')
        dispatch({ type: 'set', accessToken: null })
        // window.location.href = '/login' // 자동 로그인 실패 시 리디렉션 가능
      }
    }

    tryRefreshToken()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <BrowserRouter>
      <AppSpinner />
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <Routes>
          <Route exact path="/login" name="Login Page" element={<Login />} />
          <Route exact path="/register" name="Register Page" element={<Register />} />
          <Route exact path="/404" name="Page 404" element={<Page404 />} />
          <Route exact path="/500" name="Page 500" element={<Page500 />} />
          <Route path="*" name="Home" element={<DefaultLayout />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App

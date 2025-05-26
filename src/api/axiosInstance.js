import axios from 'axios'
import store from 'src/store'

const axiosInstance = axios.create({
  withCredentials: true, // refresh_token 쿠키 포함
})

axiosInstance.interceptors.request.use(
  (config) => {
    //화면 깜빡여서 좀 그렇네...
    // store.dispatch({ type: 'set', loading: true })

    const token = store.getState().accessToken // ✅ Redux에서 accessToken 가져옴
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    store.dispatch({ type: 'set', loading: false })
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  (response) => {
    store.dispatch({ type: 'set', loading: false })
    return response
  },
  async (error) => {
    store.dispatch({ type: 'set', loading: false })

    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // 👉 refresh_token 쿠키로 새로운 access token 요청
        const res = await axiosInstance.get('/api/auth/refresh', { withCredentials: true })

        const newAccessToken = res.data.accessToken

        // 👉 Redux에 새 토큰 저장
        store.dispatch({ type: 'set', accessToken: newAccessToken })

        // 👉 새 토큰으로 Authorization 헤더 설정 후 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        console.warn('🔐 리프레시 토큰 만료 → 로그인 페이지로 이동')
        store.dispatch({ type: 'set', accessToken: null })
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)


export default axiosInstance

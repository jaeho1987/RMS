// src/api/axiosInstance.js
import axios from 'axios'
import store from 'src/store'

const axiosInstance = axios.create({
  withCredentials: true,
})

axiosInstance.interceptors.request.use(
  config => {
    store.dispatch({ type: 'set', loading: true })
    return config
  },
  error => {
    store.dispatch({ type: 'set', loading: false })
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  response => {
    store.dispatch({ type: 'set', loading: false })
    return response
  },
  error => {
    store.dispatch({ type: 'set', loading: false })
    if (error.response?.status === 401) {
      console.warn('🔒 세션 만료됨 → /login 으로 이동')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axiosInstance

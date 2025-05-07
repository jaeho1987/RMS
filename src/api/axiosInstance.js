import axios from 'axios'

// 공통 설정 포함된 axios 인스턴스 생성
const axiosInstance = axios.create({
  withCredentials: true, // JSESSIONID 전달용
})

// 모든 응답에 대한 공통 처리: 401 → /login
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      console.warn('🔒 세션 만료됨 → /login 으로 이동')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axiosInstance

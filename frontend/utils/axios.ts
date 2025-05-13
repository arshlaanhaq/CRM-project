import axios from "axios"

// Create axios instance with base URL
const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
})
// 
// Add request interceptor to include JWT token in headers
instance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("token")

    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add response interceptor to handle common errors
instance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle 401 Unauthorized errors (expired token)
    if (error.response && error.response.status === 401) {
      // Clear localStorage and redirect to login
      localStorage.removeItem("token")
      localStorage.removeItem("userRole")
      localStorage.removeItem("userName")
      localStorage.removeItem("userEmail")
      localStorage.removeItem("isLoggedIn")

      // Redirect to login page
      window.location.href = "/login"
    }

    return Promise.reject(error)
  },
)

export default instance

// import React, {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   ReactNode,
// } from 'react'
// import { authApi } from '@/features/auth/api/auth.api'
// import { apiClient } from '@/services/api-client'
// import { User } from '@/types/user.types'

// // User interface is now imported from types

// interface AuthContextType {
//   user: User | null
//   token: string | null
//   isAuthenticated: boolean
//   login: (email: string, password: string) => Promise<void>
//   register: (email: string, password: string, name: string) => Promise<void>
//   logout: () => void
//   setAuth: (token: string, user: User) => void
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined)

// export const useAuth = () => {
//   const context = useContext(AuthContext)
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider')
//   }
//   return context
// }

// interface AuthProviderProps {
//   children: ReactNode
// }

// export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null)
//   const [token, setToken] = useState<string | null>(null)

//   const setAuth = (newToken: string, newUser: User) => {
//     setToken(newToken)
//     setUser(newUser)
//     apiClient.setToken(newToken)
//     localStorage.setItem('auth_token', newToken)
//     localStorage.setItem('auth_user', JSON.stringify(newUser))
//   }

//   useEffect(() => {
//     // Check if user is already logged in
//     const savedToken = localStorage.getItem('auth_token')
//     const savedUser = localStorage.getItem('auth_user')

//     if (savedToken && savedUser) {
//       setToken(savedToken)
//       setUser(JSON.parse(savedUser))
//       apiClient.setToken(savedToken)
//     }
//   }, [])

//   const login = async (email: string, password: string) => {
//     try {
//       const response = await authApi.login({ email, password })
//       const { access_token } = response

//       setToken(access_token)
//       apiClient.setToken(access_token)

//       // Get user profile from backend
//       const userData = await authApi.getProfile()

//       setUser(userData)

//       // Save to localStorage
//       localStorage.setItem('auth_token', access_token)
//       localStorage.setItem('auth_user', JSON.stringify(userData))
//     } catch (error) {
//       throw new Error('Login failed')
//     }
//   }

//   const register = async (email: string, password: string, name: string) => {
//     try {
//       const response = await authApi.register({ email, password, name })
//       const { access_token } = response

//       setToken(access_token)
//       apiClient.setToken(access_token)

//       // Get user profile from backend
//       const userData = await authApi.getProfile()

//       setUser(userData)

//       // Save to localStorage
//       localStorage.setItem('auth_token', access_token)
//       localStorage.setItem('auth_user', JSON.stringify(userData))
//     } catch (error) {
//       throw new Error('Registration failed')
//     }
//   }

//   const logout = () => {
//     setUser(null)
//     setToken(null)
//     apiClient.setToken(null)
//     localStorage.removeItem('auth_token')
//     localStorage.removeItem('auth_user')
//   }

//   const value: AuthContextType = {
//     user,
//     token,
//     isAuthenticated: !!user && !!token,
//     login,
//     register,
//     logout,
//     setAuth,
//   }

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
// }

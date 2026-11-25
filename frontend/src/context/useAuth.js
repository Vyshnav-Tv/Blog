import { useContext } from 'react'
import AuthContext from './AuthContextValue'

export default function useAuth() {
  return useContext(AuthContext)
}

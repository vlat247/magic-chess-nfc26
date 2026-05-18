import { useAuth as useAuthProvider } from '@/providers/auth-provider'

export function useAuth() {
  return useAuthProvider()
}

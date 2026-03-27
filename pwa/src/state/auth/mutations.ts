import { useMutation } from "@tanstack/react-query"
import { apiClient } from "@/api/client"

interface LoginCredentials {
  email: string
  password: string
}

interface LoginResponse {
  token: string
}

async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>("/auth", credentials)
  return data
}

async function resetPassword(payload: { email: string }): Promise<void> {
  await apiClient.post("/forgot-password/", payload)
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.token)
      }
    },
  })
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: resetPassword,
  })
}

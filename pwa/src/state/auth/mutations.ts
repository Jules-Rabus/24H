import { useMutation } from "@tanstack/react-query"
import { loginCheckPost, postForgotPassword } from "@/api/generated/sdk.gen"

export function useLoginMutation() {
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      await loginCheckPost({
        body: credentials,
      })
    },
  })
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: async (payload: { email: string }) => {
      await postForgotPassword({
        body: payload,
      })
    },
  })
}

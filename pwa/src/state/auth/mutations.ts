import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import {
  postForgotPassword,
  postForgotPasswordToken,
} from "@/api/generated/sdk.gen";

export function useLoginMutation() {
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      // Use apiClient directly — SDK validator expects { token } but cookie mode returns 204
      await apiClient.post("/login", credentials);
    },
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: async (payload: { email: string }) => {
      await postForgotPassword({
        body: payload,
        throwOnError: true,
      });
    },
  });
}

export function useUpdatePasswordMutation() {
  return useMutation({
    mutationFn: async ({
      token,
      password,
    }: {
      token: string;
      password: string;
    }) => {
      await postForgotPasswordToken({
        path: { tokenValue: token },
        body: { password },
        throwOnError: true,
      });
    },
  });
}

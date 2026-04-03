import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  apiUsersPost,
  apiUsersIdPatch,
  apiUsersIdDelete,
  apiUsersUserIdimagePost,
  apiUsersUserIdimageDelete,
} from "@/api/generated/sdk.gen";
import { adminUserKeys } from "./queries";

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  surname?: string | null;
  email?: string | null;
  plainPassword?: string | null;
  organization?: string | null;
  roles?: Array<string | null>;
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateUserPayload) => {
      const { data } = await apiUsersPost({ body });
      return data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all }),
  });
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: number;
      body: Partial<CreateUserPayload>;
    }) => {
      const { data } = await apiUsersIdPatch({
        path: { id: String(id) },
        body,
      });
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.detail(id) });
    },
  });
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiUsersIdDelete({ path: { id: String(id) } });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all }),
  });
}

export function useDeleteUserImageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: number) => {
      await apiUsersUserIdimageDelete({
        path: { userId: String(userId) },
      });
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
    },
  });
}

export function useUploadUserImageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, file }: { userId: number; file: File }) => {
      const { data } = await apiUsersUserIdimagePost({
        path: { userId: String(userId) },
        body: { file },
      });
      return data;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
    },
  });
}

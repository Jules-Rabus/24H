import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  apiRunsPost,
  apiRunsIdPatch,
  apiRunsIdDelete,
} from "@/api/generated/sdk.gen";
import { adminRunKeys } from "./queries";

export function useCreateRunMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { startDate: string; endDate: string }) => {
      const { data } = await apiRunsPost({ body });
      return data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminRunKeys.all }),
  });
}

export function useUpdateRunMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: number;
      body: { startDate?: string | null; endDate?: string | null };
    }) => {
      const { data } = await apiRunsIdPatch({ path: { id: String(id) }, body });
      return data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminRunKeys.all }),
  });
}

export function useDeleteRunMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRunsIdDelete({ path: { id: String(id) } });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminRunKeys.all }),
  });
}

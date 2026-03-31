import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  apiParticipationsPost,
  apiParticipationsIdPatch,
  apiParticipationsIdDelete,
} from "@/api/generated/sdk.gen";
import { adminParticipationKeys } from "./queries";

export function useCreateParticipationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { user: string; run: string }) => {
      const { data } = await apiParticipationsPost({ body });
      return data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminParticipationKeys.all }),
  });
}

export function useUpdateParticipationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      arrivalTime,
    }: {
      id: number;
      arrivalTime: string | null;
    }) => {
      const { data } = await apiParticipationsIdPatch({
        path: { id: String(id) },
        body: { arrivalTime },
      });
      return data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminParticipationKeys.all }),
  });
}

export function useDeleteParticipationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiParticipationsIdDelete({ path: { id: String(id) } });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminParticipationKeys.all }),
  });
}

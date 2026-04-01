import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRaceMediasPost } from "@/api/generated/sdk.gen";
import { apiClient } from "@/api/client";
import { raceKeys } from "../race/queries";
import { adminMediaKeys } from "../admin/medias/queries";
import { raceMediaSchema } from "./schemas";

export function useUploadRaceMediaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const file = formData.get("file") as File;
      const comment = formData.get("comment") as string | null;
      const { data } = await apiRaceMediasPost({
        body: { file, ...(comment ? { comment } : {}) },
      });
      return raceMediaSchema.parse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: raceKeys.all });
      queryClient.invalidateQueries({ queryKey: adminMediaKeys.all });
    },
  });
}

export function useLikeRaceMediaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.post(`/race_medias/${id}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminMediaKeys.all });
    },
  });
}

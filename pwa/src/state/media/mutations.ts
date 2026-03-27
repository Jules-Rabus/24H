import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/api/client"
import { raceKeys } from "../race/queries"

async function uploadRaceMedia(data: FormData) {
  const { data: response } = await apiClient.post("/race_medias", data, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return response
}

export function useUploadRaceMediaMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: uploadRaceMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: raceKeys.all })
    },
  })
}

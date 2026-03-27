import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiRaceMediasPost } from "@/api/generated/sdk.gen"
import { raceKeys } from "../race/queries"
import { raceMediaSchema } from "./schemas"

export function useUploadRaceMediaMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const file = formData.get("file") as File
      const { data } = await apiRaceMediasPost({
        body: { file },
      })
      return raceMediaSchema.parse(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: raceKeys.all })
    },
  })
}

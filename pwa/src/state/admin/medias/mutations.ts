import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiRaceMediasPost, apiRaceMediasIdDelete } from "@/api/generated/sdk.gen"
import { adminMediaKeys } from "./queries"

export function useUploadRaceMediaMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const { data } = await apiRaceMediasPost({ body: { file } })
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminMediaKeys.all }),
  })
}

export function useDeleteRaceMediaMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRaceMediasIdDelete({ path: { id: String(id) } })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminMediaKeys.all }),
  })
}

"use client"

import { useRef, useState } from "react"
import {
  Box,
  Button,
  Grid,
  Heading,
  HStack,
  IconButton,
  Input,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react"
import {
  useAdminRaceMediasQuery,
  type AdminRaceMedia,
} from "@/state/admin/medias/queries"
import {
  useUploadRaceMediaMutation,
  useDeleteRaceMediaMutation,
} from "@/state/admin/medias/mutations"
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog"

export default function AdminMediasPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [deleteMedia, setDeleteMedia] = useState<AdminRaceMedia | null>(null)

  const { data: medias, isLoading } = useAdminRaceMediasQuery()
  const uploadMutation = useUploadRaceMediaMutation()
  const deleteMutation = useDeleteRaceMediaMutation()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await uploadMutation.mutateAsync(file)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleConfirmDelete = async () => {
    if (!deleteMedia?.id) return
    await deleteMutation.mutateAsync(deleteMedia.id)
    setDeleteMedia(null)
  }

  return (
    <Box p={{ base: "4", md: "8" }}>
      {/* Header */}
      <HStack justify="space-between" align="center" mb="6" flexWrap="wrap" gap="3">
        <Heading size="xl">Médias de course</Heading>

        <Box>
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            display="none"
            onChange={handleUpload}
          />
          <Button
            colorPalette="primary"
            onClick={() => fileInputRef.current?.click()}
            loading={uploadMutation.isPending}
            loadingText="Upload..."
          >
            📷 Ajouter une photo
          </Button>
        </Box>
      </HStack>

      {/* Loading state */}
      {isLoading && (
        <VStack py="16" gap="3">
          <Spinner size="lg" />
          <Text color="fg.muted">Chargement des médias…</Text>
        </VStack>
      )}

      {/* Empty state */}
      {!isLoading && (!medias || medias.length === 0) && (
        <VStack
          py="20"
          gap="4"
          align="center"
          bg="bg.subtle"
          rounded="xl"
          borderWidth="1px"
          borderColor="border.subtle"
          borderStyle="dashed"
        >
          <Text fontSize="4xl">🖼️</Text>
          <Text color="fg.muted" fontWeight="medium">
            Aucune photo pour le moment
          </Text>
          <Button
            colorPalette="primary"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            loading={uploadMutation.isPending}
          >
            📷 Ajouter une première photo
          </Button>
        </VStack>
      )}

      {/* Photo grid */}
      {!isLoading && medias && medias.length > 0 && (
        <Grid
          templateColumns={{
            base: "repeat(2, 1fr)",
            sm: "repeat(3, 1fr)",
            md: "repeat(4, 1fr)",
            lg: "repeat(5, 1fr)",
          }}
          gap="4"
        >
          {medias.map((media) => (
            <Box
              key={media.id}
              position="relative"
              rounded="lg"
              overflow="hidden"
              bg="bg.subtle"
              aspectRatio={1}
            >
              {media.filePath && (
                <Box
                  as="img"
                  src={`${process.env.NEXT_PUBLIC_ENTRYPOINT}/${media.filePath}`}
                  alt={`Photo ${media.id}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = "/placeholder.png"
                  }}
                />
              )}

              {/* Overlay bar */}
              <Box
                position="absolute"
                bottom="0"
                left="0"
                right="0"
                bg="rgba(0,0,0,0.7)"
                px="2"
                py="1"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Text fontSize="xs" color="white">
                  {media.createdAt
                    ? new Date(media.createdAt).toLocaleDateString("fr-FR")
                    : ""}
                </Text>
                <IconButton
                  size="xs"
                  variant="ghost"
                  colorPalette="red"
                  aria-label="Supprimer"
                  color="white"
                  onClick={() => setDeleteMedia(media)}
                >
                  🗑️
                </IconButton>
              </Box>
            </Box>
          ))}
        </Grid>
      )}

      {/* Confirm delete dialog */}
      <ConfirmDialog
        open={deleteMedia !== null}
        onClose={() => setDeleteMedia(null)}
        onConfirm={handleConfirmDelete}
        title="Supprimer la photo"
        description={
          deleteMedia?.createdAt
            ? `Voulez-vous supprimer la photo du ${new Date(deleteMedia.createdAt).toLocaleDateString("fr-FR")} ? Cette action est irréversible.`
            : "Voulez-vous supprimer cette photo ? Cette action est irréversible."
        }
        loading={deleteMutation.isPending}
      />
    </Box>
  )
}

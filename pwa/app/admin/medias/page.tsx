"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  Field,
  Grid,
  Heading,
  HStack,
  IconButton,
  Input,
  Portal,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  LuCamera,
  LuChevronLeft,
  LuChevronRight,
  LuImage,
  LuSearch,
  LuTrash2,
  LuX,
} from "react-icons/lu";
import {
  useAdminRaceMediasQuery,
  type AdminRaceMedia,
} from "@/state/admin/medias/queries";
import {
  useUploadRaceMediaMutation,
  useDeleteRaceMediaMutation,
} from "@/state/admin/medias/mutations";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";

export default function AdminMediasPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteMedia, setDeleteMedia] = useState<AdminRaceMedia | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { data: medias, isLoading } = useAdminRaceMediasQuery();
  const uploadMutation = useUploadRaceMediaMutation();
  const deleteMutation = useDeleteRaceMediaMutation();

  // Client-side filter by comment text
  const filteredMedias = useMemo(() => {
    if (!medias) return [];
    if (!searchQuery.trim()) return medias;
    const q = searchQuery.trim().toLowerCase();
    return medias.filter(
      (m) => m.comment && m.comment.toLowerCase().includes(q),
    );
  }, [medias, searchQuery]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadMutation.mutateAsync(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleConfirmDelete = async () => {
    if (!deleteMedia?.id) return;
    await deleteMutation.mutateAsync(deleteMedia.id);
    setDeleteMedia(null);
  };

  // Lightbox navigation
  const lightboxMedia =
    lightboxIndex !== null ? (filteredMedias[lightboxIndex] ?? null) : null;

  const goToPrev = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null || prev <= 0) return prev;
      return prev - 1;
    });
  }, []);

  const goToNext = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null || prev >= filteredMedias.length - 1) return prev;
      return prev + 1;
    });
  }, [filteredMedias.length]);

  return (
    <Box p={{ base: "4", md: "8" }}>
      {/* Header */}
      <HStack
        justify="space-between"
        align="center"
        mb="6"
        flexWrap="wrap"
        gap="3"
      >
        <Heading size="xl">Medias de course</Heading>

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
            <LuCamera /> Ajouter une photo
          </Button>
        </Box>
      </HStack>

      {/* Search filter */}
      <Box mb="6">
        <Field.Root>
          <HStack gap="2">
            <Box position="relative" flex="1" maxW="400px">
              <Box
                position="absolute"
                left="3"
                top="50%"
                transform="translateY(-50%)"
                color="fg.muted"
                zIndex="1"
                pointerEvents="none"
              >
                <LuSearch />
              </Box>
              <Input
                placeholder="Filtrer par commentaire..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                pl="10"
                size="sm"
              />
            </Box>
            {searchQuery && (
              <IconButton
                aria-label="Effacer la recherche"
                size="sm"
                variant="ghost"
                onClick={() => setSearchQuery("")}
              >
                <LuX />
              </IconButton>
            )}
          </HStack>
        </Field.Root>
        {searchQuery && medias && (
          <Text fontSize="xs" color="fg.muted" mt="1">
            {filteredMedias.length} resultat
            {filteredMedias.length !== 1 ? "s" : ""} sur {medias.length}
          </Text>
        )}
      </Box>

      {/* Loading state */}
      {isLoading && (
        <VStack py="16" gap="3">
          <Spinner size="lg" />
          <Text color="fg.muted">Chargement des medias...</Text>
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
          <LuImage size={40} />
          <Text color="fg.muted" fontWeight="medium">
            Aucune photo pour le moment
          </Text>
          <Button
            colorPalette="primary"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            loading={uploadMutation.isPending}
          >
            <LuCamera /> Ajouter une premiere photo
          </Button>
        </VStack>
      )}

      {/* No results for filter */}
      {!isLoading &&
        medias &&
        medias.length > 0 &&
        filteredMedias.length === 0 && (
          <VStack py="16" gap="3">
            <LuSearch size={32} />
            <Text color="fg.muted" fontWeight="medium">
              Aucun media ne correspond au filtre
            </Text>
          </VStack>
        )}

      {/* Photo grid */}
      {!isLoading && filteredMedias.length > 0 && (
        <Grid
          templateColumns={{
            base: "repeat(2, 1fr)",
            sm: "repeat(3, 1fr)",
            md: "repeat(4, 1fr)",
            lg: "repeat(5, 1fr)",
          }}
          gap="4"
        >
          {filteredMedias.map((media, index) => (
            <Box
              key={media.id}
              position="relative"
              rounded="lg"
              overflow="hidden"
              bg="bg.subtle"
              aspectRatio={1}
              cursor="pointer"
              onClick={() => setLightboxIndex(index)}
              _hover={{ opacity: 0.85 }}
              transition="opacity 0.15s"
            >
              {media.contentUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={media.contentUrl}
                  alt={`Photo ${media.id}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.png";
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
                py="1.5"
              >
                {media.comment && (
                  <Text fontSize="xs" color="white" truncate mb="0.5">
                    {media.comment}
                  </Text>
                )}
                <HStack justify="space-between" align="center">
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteMedia(media);
                    }}
                  >
                    <LuTrash2 />
                  </IconButton>
                </HStack>
              </Box>
            </Box>
          ))}
        </Grid>
      )}

      {/* Lightbox dialog */}
      <Dialog.Root
        open={lightboxIndex !== null}
        onOpenChange={({ open }) => !open && setLightboxIndex(null)}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content
              maxW="90vw"
              maxH="90vh"
              bg="black"
              p="0"
              overflow="hidden"
            >
              <Dialog.Body p="0" position="relative">
                {/* Close button */}
                <IconButton
                  aria-label="Fermer"
                  position="absolute"
                  top="3"
                  right="3"
                  zIndex="10"
                  size="sm"
                  variant="ghost"
                  color="white"
                  _hover={{ bg: "whiteAlpha.300" }}
                  onClick={() => setLightboxIndex(null)}
                >
                  <LuX />
                </IconButton>

                {/* Previous button */}
                {lightboxIndex !== null && lightboxIndex > 0 && (
                  <IconButton
                    aria-label="Photo precedente"
                    position="absolute"
                    left="3"
                    top="50%"
                    transform="translateY(-50%)"
                    zIndex="10"
                    size="lg"
                    variant="ghost"
                    color="white"
                    _hover={{ bg: "whiteAlpha.300" }}
                    onClick={goToPrev}
                  >
                    <LuChevronLeft />
                  </IconButton>
                )}

                {/* Next button */}
                {lightboxIndex !== null &&
                  lightboxIndex < filteredMedias.length - 1 && (
                    <IconButton
                      aria-label="Photo suivante"
                      position="absolute"
                      right="3"
                      top="50%"
                      transform="translateY(-50%)"
                      zIndex="10"
                      size="lg"
                      variant="ghost"
                      color="white"
                      _hover={{ bg: "whiteAlpha.300" }}
                      onClick={goToNext}
                    >
                      <LuChevronRight />
                    </IconButton>
                  )}

                {/* Image */}
                {lightboxMedia?.contentUrl && (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    minH="60vh"
                    maxH="80vh"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={lightboxMedia.contentUrl}
                      alt={`Photo ${lightboxMedia.id}`}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "80vh",
                        objectFit: "contain",
                      }}
                    />
                  </Box>
                )}

                {/* Bottom info bar */}
                {lightboxMedia && (
                  <Box
                    position="absolute"
                    bottom="0"
                    left="0"
                    right="0"
                    bg="rgba(0,0,0,0.75)"
                    px="4"
                    py="3"
                  >
                    <HStack justify="space-between" align="center">
                      <VStack align="start" gap="0">
                        {lightboxMedia.comment && (
                          <Text fontSize="sm" color="white">
                            {lightboxMedia.comment}
                          </Text>
                        )}
                        <Text fontSize="xs" color="whiteAlpha.700">
                          {lightboxMedia.createdAt
                            ? new Date(
                                lightboxMedia.createdAt,
                              ).toLocaleDateString("fr-FR")
                            : ""}
                          {lightboxIndex !== null &&
                            ` -- ${lightboxIndex + 1} / ${filteredMedias.length}`}
                        </Text>
                      </VStack>
                      <IconButton
                        size="sm"
                        variant="ghost"
                        colorPalette="red"
                        aria-label="Supprimer"
                        color="white"
                        onClick={() => {
                          if (lightboxMedia) {
                            setDeleteMedia(lightboxMedia);
                            setLightboxIndex(null);
                          }
                        }}
                      >
                        <LuTrash2 />
                      </IconButton>
                    </HStack>
                  </Box>
                )}
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Confirm delete dialog */}
      <ConfirmDialog
        open={deleteMedia !== null}
        onClose={() => setDeleteMedia(null)}
        onConfirm={handleConfirmDelete}
        title="Supprimer la photo"
        description={
          deleteMedia?.createdAt
            ? `Voulez-vous supprimer la photo du ${new Date(deleteMedia.createdAt).toLocaleDateString("fr-FR")} ? Cette action est irreversible.`
            : "Voulez-vous supprimer cette photo ? Cette action est irreversible."
        }
        loading={deleteMutation.isPending}
      />
    </Box>
  );
}

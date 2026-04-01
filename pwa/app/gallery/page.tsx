"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  IconButton,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useAdminRaceMediasQuery } from "@/state/admin/medias/queries";
import { useLikes } from "@/hooks/useLikes";
import { useLikeRaceMediaMutation } from "@/state/media/mutations";
import {
  LuImages,
  LuCamera,
  LuX,
  LuChevronLeft,
  LuChevronRight,
} from "react-icons/lu";
import { PublicNav } from "@/components/public/PublicNav";
import type { RaceMedia } from "@/state/media/schemas";

function isVideo(media: RaceMedia) {
  return media.contentType?.startsWith("video/") ?? false;
}

function Lightbox({
  medias,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  medias: RaceMedia[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const media = medias[index];
  const { hasLiked, like } = useLikes();
  const likeMutation = useLikeRaceMediaMutation();

  const handleLike = async () => {
    if (!media?.id || hasLiked(media.id)) return;
    await like(media.id);
    likeMutation.mutate(media.id);
  };

  if (!media) return null;

  return (
    <Box
      position="fixed"
      inset="0"
      bg="#111"
      zIndex="modal"
      display="flex"
      flexDirection="column"
    >
      {/* Header */}
      <Flex justify="space-between" align="center" px="4" py="3" flexShrink={0}>
        <Text color="white" fontWeight="bold" fontVariantNumeric="tabular-nums">
          {index + 1} / {medias.length}
        </Text>
        <IconButton
          aria-label="Fermer"
          variant="ghost"
          color="white"
          onClick={onClose}
          size="sm"
        >
          <LuX />
        </IconButton>
      </Flex>

      {/* Media */}
      <Flex flex="1" align="center" justify="center" overflow="hidden" px="2">
        {isVideo(media) ? (
          <video
            controls
            autoPlay
            src={media.contentUrl ?? ""}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            }}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={media.contentUrl ?? ""}
            alt="Photo de la course"
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            }}
          />
        )}
      </Flex>

      {/* Bottom bar */}
      <Box bg="#1e1e1e" px="4" py="3" flexShrink={0}>
        <Flex
          justify="space-between"
          align="center"
          mb={media.comment ? "2" : "0"}
        >
          <Box>
            {media.createdAt && (
              <Text
                color="whiteAlpha.700"
                fontSize="sm"
                fontVariantNumeric="tabular-nums"
              >
                {new Date(media.createdAt).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </Text>
            )}
          </Box>
          <Button
            aria-label="like"
            size="sm"
            variant={hasLiked(media.id!) ? "solid" : "outline"}
            colorPalette={hasLiked(media.id!) ? "red" : "gray"}
            color={hasLiked(media.id!) ? "white" : "whiteAlpha.800"}
            borderColor="whiteAlpha.400"
            disabled={hasLiked(media.id!)}
            onClick={handleLike}
          >
            {hasLiked(media.id!) ? "\u2764\uFE0F" : "\u2764"} {media.likesCount}
          </Button>
        </Flex>
        {media.comment && (
          <Text color="whiteAlpha.900" fontSize="sm" mb="2">
            {media.comment}
          </Text>
        )}
        <Flex justify="space-between" mt="2">
          <Button
            size="sm"
            variant="ghost"
            color="white"
            onClick={onPrev}
            disabled={index === 0}
          >
            <LuChevronLeft /> Precedent
          </Button>
          <Button
            size="sm"
            variant="ghost"
            color="white"
            onClick={onNext}
            disabled={index === medias.length - 1}
          >
            Suivant <LuChevronRight />
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}

export default function GalleryPage() {
  const router = useRouter();
  const { data: medias, isLoading } = useAdminRaceMediasQuery();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const sortedMedias = useMemo(() => {
    const list = (medias ?? []).filter((m) => m.contentUrl);
    return [...list].sort((a, b) => {
      const likeDiff = (b.likesCount ?? 0) - (a.likesCount ?? 0);
      if (likeDiff !== 0) return likeDiff;
      return (
        new Date(b.createdAt ?? 0).getTime() -
        new Date(a.createdAt ?? 0).getTime()
      );
    });
  }, [medias]);

  return (
    <Box bg="bg.canvas" minH="100vh" colorPalette="primary">
      <PublicNav />

      {/* Top bar */}
      <Box
        bg="card.bg"
        borderBottomWidth="1px"
        borderColor="card.border"
        mb="8"
      >
        <Container maxW="container.xl" py="4">
          <HStack justify="space-between">
            <HStack gap="2">
              <Icon color="primary.fg" boxSize="5">
                <LuImages />
              </Icon>
              <Heading size="md" fontWeight="black" letterSpacing="tighter">
                Galerie
              </Heading>
              {sortedMedias.length > 0 && (
                <Badge colorPalette="primary" variant="subtle" fontSize="xs">
                  {sortedMedias.length}
                </Badge>
              )}
            </HStack>
            <Button
              size="sm"
              colorPalette="primary"
              onClick={() => router.push("/upload")}
              aria-label="Partager"
            >
              <LuCamera /> Partager
            </Button>
          </HStack>
        </Container>
      </Box>

      <Container maxW="container.xl" pb="16">
        {isLoading ? (
          <Flex align="center" justify="center" py="20" gap="3">
            <Spinner color="colorPalette.fg" />
            <Text color="fg.muted">Chargement...</Text>
          </Flex>
        ) : sortedMedias.length === 0 ? (
          <Flex
            direction="column"
            align="center"
            py="20"
            gap="4"
            textAlign="center"
          >
            <Icon boxSize="16" color="fg.subtle">
              <LuCamera />
            </Icon>
            <Heading size="lg" color="fg.muted">
              Aucune photo pour le moment
            </Heading>
            <Text color="fg.subtle">
              Soyez le premier a partager votre moment !
            </Text>
            <Button
              colorPalette="primary"
              onClick={() => router.push("/upload")}
            >
              <LuCamera /> Envoyer une photo
            </Button>
          </Flex>
        ) : (
          <Grid templateColumns="repeat(3, 1fr)" gap="3">
            {sortedMedias.map((media, idx) => (
              <Box
                key={media.id}
                position="relative"
                overflow="hidden"
                rounded="xl"
                bg="bg.subtle"
                shadow="sm"
                cursor="pointer"
                gridColumn={idx === 0 ? "span 3" : undefined}
                aspectRatio={idx === 0 ? "16/9" : "1/1"}
                _hover={{ shadow: "md", transform: "scale(1.02)" }}
                transition="all 0.2s"
                onClick={() => setLightboxIndex(idx)}
              >
                {isVideo(media) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={media.contentUrl ?? ""}
                    alt="Video de la course"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={media.contentUrl ?? ""}
                    alt="Photo de la course"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                )}

                {/* Like count badge */}
                {(media.likesCount ?? 0) > 0 && (
                  <Box
                    position="absolute"
                    bottom="2"
                    right="2"
                    bg="blackAlpha.700"
                    color="white"
                    px="2"
                    py="0.5"
                    rounded="full"
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    {"\u2764\uFE0F"} {media.likesCount}
                  </Box>
                )}

                {/* Video play badge */}
                {isVideo(media) && (
                  <Box
                    position="absolute"
                    top="2"
                    left="2"
                    bg="blackAlpha.700"
                    color="white"
                    px="2"
                    py="0.5"
                    rounded="full"
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    {"\u25B6"}
                  </Box>
                )}
              </Box>
            ))}
          </Grid>
        )}
      </Container>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          medias={sortedMedias}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((i) => Math.max(0, (i ?? 0) - 1))}
          onNext={() =>
            setLightboxIndex((i) =>
              Math.min(sortedMedias.length - 1, (i ?? 0) + 1),
            )
          }
        />
      )}
    </Box>
  );
}

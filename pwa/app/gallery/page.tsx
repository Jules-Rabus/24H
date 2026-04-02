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
  Skeleton,
  Text,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { usePublicRaceMediasQuery } from "@/state/public/mediaQueries";
import { useLikes } from "@/hooks/useLikes";
import { useLikeRaceMediaMutation } from "@/state/media/mutations";
import { LuImages, LuCamera, LuHeart, LuX, LuPlay } from "react-icons/lu";
import { PublicNav } from "@/components/public/PublicNav";
import type { RaceMedia } from "@/state/media/schemas";

function isVideo(media: RaceMedia) {
  return media.contentType?.startsWith("video/") ?? false;
}

function formatHour(createdAt: string | null | undefined): string {
  if (!createdAt) return "";
  return new Date(createdAt).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function GalleryPage() {
  const router = useRouter();
  const { data: medias, isLoading } = usePublicRaceMediasQuery();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { hasLiked, like } = useLikes();
  const likeMutation = useLikeRaceMediaMutation();

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

  const handleLike = (id: number) => {
    if (hasLiked(id)) return;
    like(id);
    likeMutation.mutate(id);
  };

  return (
    <Box bg="bg.canvas" minH="100vh" colorPalette="primary">
      <PublicNav />

      <Box
        bg="bg.panel"
        borderBottomWidth="1px"
        borderColor="border.subtle"
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
          <Grid templateColumns="repeat(3, 1fr)" gap="3">
            <Skeleton height="280px" rounded="xl" gridColumn="span 3" />
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} height="120px" rounded="xl" />
            ))}
          </Grid>
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
              Soyez le premier à partager votre moment !
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
            {sortedMedias.map((media, idx) => {
              const isExpanded = expandedId === media.id;
              const liked = hasLiked(media.id!);

              return (
                <Box
                  key={media.id}
                  gridColumn={isExpanded || idx === 0 ? "span 3" : undefined}
                  borderRadius="xl"
                  overflow="hidden"
                  bg="bg.panel"
                  borderWidth="1px"
                  borderColor="border.subtle"
                  shadow={isExpanded ? "lg" : "sm"}
                >
                  {/* Zone image */}
                  <Box
                    position="relative"
                    aspectRatio={
                      isExpanded ? undefined : idx === 0 ? "16/9" : "1/1"
                    }
                    bg={isExpanded ? "black" : "bg.subtle"}
                    cursor={isExpanded ? "default" : "pointer"}
                    minH={isExpanded ? "200px" : undefined}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    onClick={
                      isExpanded ? undefined : () => setExpandedId(media.id!)
                    }
                  >
                    {isVideo(media) ? (
                      isExpanded ? (
                        <video
                          controls
                          autoPlay
                          src={media.contentUrl ?? ""}
                          style={{
                            maxWidth: "100%",
                            maxHeight: "70vh",
                            objectFit: "contain",
                          }}
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={media.contentUrl ?? ""}
                          alt="Vidéo de la course"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                        />
                      )
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={media.contentUrl ?? ""}
                        alt="Photo de la course"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          maxHeight: isExpanded ? "70vh" : undefined,
                        }}
                      />
                    )}

                    {/* Badge vidéo */}
                    {isVideo(media) && !isExpanded && (
                      <Box
                        position="absolute"
                        top="2"
                        left="2"
                        bg="blackAlpha.600"
                        color="white"
                        px="2"
                        py="0.5"
                        rounded="full"
                        fontSize="xs"
                        fontWeight="bold"
                        display="flex"
                        alignItems="center"
                        gap="1"
                      >
                        <LuPlay size={10} />
                      </Box>
                    )}

                    {/* Pill heure */}
                    {media.createdAt && (
                      <Box
                        position="absolute"
                        bottom="2"
                        left="2"
                        bg="blackAlpha.600"
                        color="white"
                        px="2"
                        py="0.5"
                        rounded="full"
                        fontSize="xs"
                        fontWeight="medium"
                      >
                        {formatHour(media.createdAt)}
                      </Box>
                    )}

                    {/* Pill likes (display-only en mode normal) */}
                    {!isExpanded && (
                      <Box
                        position="absolute"
                        bottom="2"
                        right="2"
                        bg="blackAlpha.600"
                        color="white"
                        px="2"
                        py="0.5"
                        rounded="full"
                        fontSize="xs"
                        fontWeight="bold"
                        display="flex"
                        alignItems="center"
                        gap="1"
                      >
                        <LuHeart
                          size={10}
                          color={liked ? "#ff6b6b" : "white"}
                        />
                        {media.likesCount}
                      </Box>
                    )}

                    {/* Bouton fermer (mode agrandi) */}
                    {isExpanded && (
                      <IconButton
                        aria-label="Fermer"
                        position="absolute"
                        top="2"
                        right="2"
                        size="sm"
                        bg="blackAlpha.600"
                        color="white"
                        rounded="full"
                        variant="ghost"
                        _hover={{ bg: "blackAlpha.800" }}
                        onClick={() => setExpandedId(null)}
                      >
                        <LuX />
                      </IconButton>
                    )}
                  </Box>

                  {/* Zone commentaire + like (mode agrandi) */}
                  <Box bg="bg.panel" px="3" py="2" minH="8">
                    {media.comment && (
                      <Text
                        fontSize="sm"
                        color="fg.default"
                        mb={isExpanded ? "2" : "0"}
                      >
                        {media.comment}
                      </Text>
                    )}
                    {isExpanded && (
                      <Button
                        size="sm"
                        variant={liked ? "solid" : "outline"}
                        colorPalette="red"
                        disabled={liked}
                        onClick={() => handleLike(media.id!)}
                        mt={media.comment ? "1" : "0"}
                      >
                        <LuHeart /> {liked ? "Aimé" : "J'aime"} ·{" "}
                        {media.likesCount}
                      </Button>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Grid>
        )}
      </Container>
    </Box>
  );
}

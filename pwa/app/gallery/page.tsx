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
  Skeleton,
  Text,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { usePublicRaceMediasQuery } from "@/state/public/mediaQueries";
import { LuImages, LuCamera } from "react-icons/lu";
import { PublicNav } from "@/components/public/PublicNav";
import { GalleryLightbox } from "@/components/public/GalleryLightbox";
import type { RaceMedia } from "@/state/media/schemas";

function isVideo(media: RaceMedia) {
  return media.contentType?.startsWith("video/") ?? false;
}

export default function GalleryPage() {
  const router = useRouter();
  const { data: medias, isLoading } = usePublicRaceMediasQuery();
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
        <GalleryLightbox
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

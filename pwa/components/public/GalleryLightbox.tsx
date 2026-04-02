"use client";
import { Box, Button, Flex, IconButton, Text } from "@chakra-ui/react";
import { LuX, LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { useLikes } from "@/hooks/useLikes";
import { useLikeRaceMediaMutation } from "@/state/media/mutations";
import type { RaceMedia } from "@/state/media/schemas";

function isVideo(media: RaceMedia) {
  return media.contentType?.startsWith("video/") ?? false;
}

export function GalleryLightbox({
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

  const handleLike = () => {
    if (!media?.id || hasLiked(media.id)) return;
    like(media.id); // updates localStorage only (synchronous)
    likeMutation.mutate(media.id); // fires the HTTP POST via TanStack Query
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

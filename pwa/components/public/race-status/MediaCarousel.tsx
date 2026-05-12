"use client";

import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  IconButton,
  Skeleton,
  Text,
} from "@chakra-ui/react";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  LuCamera,
  LuChevronLeft,
  LuChevronRight,
  LuImages,
} from "react-icons/lu";
import type { RaceMedia } from "@/state/media/schemas";

type MediaCarouselProps = {
  isLoading: boolean;
  medias: RaceMedia[];
  /** mobile = 1.2 slides visible, desktop = 3. Defaults to desktop. */
  variant?: "mobile" | "desktop";
};

export function MediaCarousel({
  isLoading,
  medias,
  variant = "desktop",
}: MediaCarouselProps) {
  const mediaList = medias.filter((m) => m.contentUrl);
  const isMobile = variant === "mobile";

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    slidesToScroll: isMobile ? 1 : 3,
    align: "start",
  });

  const autoplayTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaCount = mediaList.length;
  const minToAutoplay = isMobile ? 2 : 3;
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateButtons = useCallback(() => {
    if (!emblaApi) return;
    // With loop:true, canScrollPrev/Next always return true when there's >1 slide.
    setCanPrev(mediaCount > 1);
    setCanNext(mediaCount > 1);
  }, [emblaApi, mediaCount]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", updateButtons);
    emblaApi.on("reInit", updateButtons);
    const t = setTimeout(updateButtons, 0);
    return () => {
      clearTimeout(t);
      emblaApi.off("select", updateButtons);
      emblaApi.off("reInit", updateButtons);
    };
  }, [emblaApi, updateButtons]);

  useEffect(() => {
    if (!emblaApi || mediaCount <= minToAutoplay) return;
    autoplayTimer.current = setInterval(() => emblaApi.scrollNext(), 4000);
    return () => {
      if (autoplayTimer.current) clearInterval(autoplayTimer.current);
    };
  }, [emblaApi, mediaCount, minToAutoplay]);

  return (
    <Box
      position="relative"
      overflow="hidden"
      borderRightWidth={{ base: 0, md: isMobile ? 0 : "1px" }}
      borderColor="card.border"
      bg="card.bg"
      p="3"
    >
      {/* Header : titre + flèches + bouton "Voir la galerie" */}
      <Flex
        align="center"
        justify="space-between"
        mb="2"
        px="1"
        gap="2"
        flexWrap="wrap"
      >
        <Text
          fontSize="xs"
          fontWeight="700"
          letterSpacing="0.1em"
          textTransform="uppercase"
          color="fg.muted"
        >
          Photos partagées
        </Text>
        <HStack gap="2">
          {mediaList.length > 1 && (
            <HStack gap="1">
              <IconButton
                aria-label="Photo précédente"
                size="xs"
                variant="ghost"
                onClick={() => emblaApi?.scrollPrev()}
                disabled={!canPrev}
              >
                <LuChevronLeft />
              </IconButton>
              <IconButton
                aria-label="Photo suivante"
                size="xs"
                variant="ghost"
                onClick={() => emblaApi?.scrollNext()}
                disabled={!canNext}
              >
                <LuChevronRight />
              </IconButton>
            </HStack>
          )}
          <Link href="/gallery" style={{ textDecoration: "none" }}>
            <Button
              size="xs"
              variant="outline"
              colorPalette="primary"
              fontWeight="700"
            >
              <LuImages />
              Galerie
            </Button>
          </Link>
        </HStack>
      </Flex>

      {isLoading ? (
        <Flex gap="2">
          {Array.from({ length: isMobile ? 2 : 3 }).map((_, i) => (
            <Skeleton key={i} flex="1" rounded="xl" minH="32" />
          ))}
        </Flex>
      ) : mediaList.length === 0 ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          gap="3"
          color="fg.muted"
          py="6"
        >
          <Icon as={LuCamera} boxSize="10" color="fg.subtle" />
          <Box textAlign="center">
            <Text fontSize="md" fontWeight="700" color="fg.muted">
              Aucune photo pour le moment
            </Text>
            <Text fontSize="sm" color="fg.subtle">
              Les photos partagées s&apos;afficheront ici.
            </Text>
          </Box>
        </Flex>
      ) : (
        <Flex direction="column" gap="2">
          <Box
            overflow="hidden"
            ref={emblaRef}
            style={{ touchAction: "pan-y" }}
          >
            <Flex gap="2">
              {mediaList.map((m, i) => (
                <Box
                  key={m.id ?? i}
                  flexShrink={0}
                  style={
                    isMobile
                      ? { flex: "0 0 calc(80% - 8px)" }
                      : { flex: "0 0 calc(33.333% - 6px)" }
                  }
                  rounded="xl"
                  overflow="hidden"
                  bg="bg.subtle"
                  position="relative"
                  display="flex"
                  flexDirection="column"
                  minH={isMobile ? "44" : "40"}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.contentUrl ?? ""}
                    alt="Race media"
                    style={{
                      width: "100%",
                      flex: 1,
                      objectFit: "cover",
                      minHeight: 0,
                    }}
                  />
                  {m.createdAt && (
                    <Box
                      position="absolute"
                      top="2"
                      right="2"
                      bg="blackAlpha.700"
                      backdropFilter="blur(4px)"
                      px="2"
                      py="0.5"
                      rounded="md"
                    >
                      <Text
                        fontSize="2xs"
                        fontWeight="700"
                        color="whiteAlpha.900"
                        fontFamily="mono"
                        fontVariantNumeric="tabular-nums"
                      >
                        {new Date(m.createdAt).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </Box>
                  )}
                  {m.comment && (
                    <Box px="2" py="1.5" bg="blackAlpha.700" flexShrink={0}>
                      <Text
                        fontSize="11px"
                        color="whiteAlpha.900"
                        lineClamp={2}
                      >
                        {m.comment}
                      </Text>
                    </Box>
                  )}
                </Box>
              ))}
            </Flex>
          </Box>
          <Text
            fontSize="xs"
            color="fg.muted"
            fontWeight="700"
            flexShrink={0}
            px="1"
          >
            {mediaList.length} photo{mediaList.length > 1 ? "s" : ""}
          </Text>
        </Flex>
      )}
    </Box>
  );
}

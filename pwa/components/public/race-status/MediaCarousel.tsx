"use client";

import { Box, Flex, Icon, Skeleton, Text } from "@chakra-ui/react";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useRef } from "react";
import { LuCamera } from "react-icons/lu";
import type { AdminRaceMedia } from "@/state/admin/medias/queries";

type MediaCarouselProps = {
  isLoading: boolean;
  medias: AdminRaceMedia[];
};

export function MediaCarousel({ isLoading, medias }: MediaCarouselProps) {
  const mediaList = medias.filter((m) => m.contentUrl);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    slidesToScroll: 3,
    align: "start",
  });

  const autoplayTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaCount = mediaList.length;

  useEffect(() => {
    if (!emblaApi || mediaCount <= 3) return;
    autoplayTimer.current = setInterval(() => emblaApi.scrollNext(), 4000);
    return () => {
      if (autoplayTimer.current) clearInterval(autoplayTimer.current);
    };
  }, [emblaApi, mediaCount]);

  return (
    <Box
      position="relative"
      overflow="hidden"
      borderRightWidth="1px"
      borderColor="whiteAlpha.100"
      bg="gray.900"
      p="3"
    >
      {isLoading ? (
        <Flex h="full" gap="2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} flex="1" rounded="xl" />
          ))}
        </Flex>
      ) : mediaList.length === 0 ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          h="full"
          gap="3"
          color="gray.500"
        >
          <Icon as={LuCamera} boxSize="12" color="gray.700" />
          <Box textAlign="center">
            <Text fontSize="md" fontWeight="700" color="gray.400">
              Aucune photo pour le moment
            </Text>
            <Text fontSize="sm" color="gray.600">
              Scannez le QR code pour partager votre moment !
            </Text>
          </Box>
        </Flex>
      ) : (
        <Flex h="full" direction="column" gap="2">
          {/* Embla viewport */}
          <Box overflow="hidden" flex="1" ref={emblaRef}>
            <Flex h="full" gap="2">
              {mediaList.map((m, i) => (
                <Box
                  key={m.id ?? i}
                  flexShrink={0}
                  style={{ flex: "0 0 calc(33.333% - 6px)" }}
                  rounded="xl"
                  overflow="hidden"
                  bg="gray.800"
                  position="relative"
                  display="flex"
                  flexDirection="column"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.contentUrl ?? ""}
                    alt="Race media"
                    style={{
                      width: "100%",
                      flex: 1,
                      objectFit: "contain",
                      minHeight: 0,
                    }}
                  />
                  {m.comment && (
                    <Box px="2" py="1.5" bg="blackAlpha.800" flexShrink={0}>
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
            color="gray.600"
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

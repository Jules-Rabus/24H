"use client";

import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useAdminRaceMediasQuery } from "@/state/admin/medias/queries";
import { ColorModeButton } from "../../components/ui/color-mode";
import { LuArrowLeft, LuImages, LuCamera } from "react-icons/lu";

export default function GalleryPage() {
  const router = useRouter();
  const { data: medias, isLoading } = useAdminRaceMediasQuery();
  const mediaList = medias?.filter((m) => m.contentUrl) ?? [];

  return (
    <Box bg="bg.canvas" minH="100vh" colorPalette="primary">
      {/* Header */}
      <Box
        as="header"
        bg="bg.panel"
        borderBottomWidth="1px"
        borderColor="border.subtle"
        mb="8"
      >
        <Container maxW="container.xl" py="4">
          <HStack justify="space-between">
            <HStack gap="3">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <LuArrowLeft /> Retour
              </Button>
              <HStack gap="2">
                <Icon as={LuImages} color="colorPalette.fg" boxSize="5" />
                <Heading size="md" fontWeight="black" letterSpacing="tighter">
                  Galerie Photos
                </Heading>
              </HStack>
            </HStack>
            <HStack gap="2">
              <Button
                size="sm"
                colorPalette="primary"
                onClick={() => router.push("/upload")}
              >
                <LuCamera /> Ajouter une photo
              </Button>
              <ColorModeButton />
            </HStack>
          </HStack>
        </Container>
      </Box>

      <Container maxW="container.xl" pb="16">
        {isLoading ? (
          <Flex align="center" justify="center" py="20" gap="3">
            <Spinner color="colorPalette.fg" />
            <Text color="fg.muted">Chargement des photos...</Text>
          </Flex>
        ) : mediaList.length === 0 ? (
          <VStack py="20" gap="4" textAlign="center">
            <Icon as={LuCamera} boxSize="16" color="fg.subtle" />
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
          </VStack>
        ) : (
          <>
            <HStack justify="space-between" mb="6">
              <Text fontSize="sm" color="fg.muted">
                {mediaList.length} photo{mediaList.length > 1 ? "s" : ""}
              </Text>
            </HStack>
            <Grid
              templateColumns={{
                base: "1fr 1fr",
                sm: "repeat(3, 1fr)",
                md: "repeat(4, 1fr)",
                lg: "repeat(5, 1fr)",
              }}
              gap="3"
            >
              {mediaList.map((media) => (
                <Box
                  key={media.id}
                  position="relative"
                  overflow="hidden"
                  rounded="xl"
                  aspectRatio="1"
                  bg="bg.subtle"
                  shadow="sm"
                  _hover={{ shadow: "md", transform: "scale(1.02)" }}
                  transition="all 0.2s"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={media.filePath ?? ""}
                    alt="Photo de la course"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  {(media.createdAt || media.comment) && (
                    <Box
                      position="absolute"
                      bottom="0"
                      left="0"
                      right="0"
                      px="2"
                      py="1"
                      bg="blackAlpha.700"
                    >
                      {media.comment && (
                        <Text
                          fontSize="11px"
                          color="whiteAlpha.900"
                          fontWeight="medium"
                          lineClamp={2}
                          mb="0.5"
                        >
                          {media.comment}
                        </Text>
                      )}
                      {media.createdAt && (
                        <Text
                          fontSize="10px"
                          color="whiteAlpha.700"
                          fontVariantNumeric="tabular-nums"
                        >
                          {new Date(media.createdAt).toLocaleTimeString(
                            "fr-FR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </Text>
                      )}
                    </Box>
                  )}
                </Box>
              ))}
            </Grid>
          </>
        )}
      </Container>
    </Box>
  );
}

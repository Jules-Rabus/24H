"use client";

import {
  Box,
  Button,
  Container,
  Textarea,
  Text,
  VStack,
  HStack,
  Icon,
  Field,
} from "@chakra-ui/react";
import { useForm } from "@tanstack/react-form";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUploadRaceMediaMutation } from "@/state/media/mutations";
import { PublicNav } from "@/components/public/PublicNav";
import {
  LuCamera,
  LuCircleCheck,
  LuCircleAlert,
  LuSend,
  LuX,
  LuImage,
  LuVideo,
} from "react-icons/lu";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/quicktime",
  "video/webm",
];

const MAX_SIZE = 25 * 1024 * 1024;

export default function UploadPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const uploadMutation = useUploadRaceMediaMutation();

  const form = useForm({
    defaultValues: {
      file: undefined as File | undefined,
      comment: "",
    },
    onSubmit: async ({ value }) => {
      try {
        const formData = new FormData();
        if (value.file) formData.append("file", value.file);
        if (value.comment) formData.append("comment", value.comment);
        await uploadMutation.mutateAsync(formData);
        setSuccess(true);
      } catch {
        setError("Erreur lors de l'envoi. Veuillez réessayer.");
      }
    },
  });

  const handleFileSelect = (file: File | undefined) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      setIsVideo(file.type.startsWith("video/"));
    } else {
      setPreviewUrl(null);
      setIsVideo(false);
    }
  };

  const clearFile = () => {
    form.setFieldValue("file", undefined);
    handleFileSelect(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (success) {
    return (
      <Box bg="bg.canvas" minH="100vh" colorPalette="primary">
        <PublicNav />
        <Container maxW="md" pt="30" pb="24">
          <VStack
            bg="bg.panel"
            p={{ base: "6", md: "10" }}
            shadow="lg"
            borderRadius="2xl"
            borderWidth="1px"
            borderColor="border.subtle"
            gap="6"
            textAlign="center"
          >
            <Icon as={LuCircleCheck} boxSize="16" color="green.500" />
            <Box>
              <Text fontWeight="bold" fontSize="xl" mb="2">
                Média partagé !
              </Text>
              <Text color="fg.muted">Merci pour votre contribution.</Text>
            </Box>
            <Button w="full" size="lg" onClick={() => router.push("/gallery")}>
              Voir la galerie
            </Button>
            <Button
              variant="outline"
              w="full"
              onClick={() => router.push("/classement")}
            >
              Voir le classement
            </Button>
            <Button
              variant="ghost"
              w="full"
              onClick={() => {
                setSuccess(false);
                setError("");
                clearFile();
                form.reset();
              }}
            >
              Partager un autre
            </Button>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg="bg.canvas" minH="100vh" colorPalette="primary">
      <PublicNav />

      <Container maxW="md" py="8" pb="24">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <VStack gap="6" align="stretch">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif,video/mp4,video/quicktime,video/webm,.jpg,.jpeg,.png,.webp,.heic,.heif,.mp4,.mov,.webm"
              capture="environment"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  form.setFieldValue("file", file);
                  handleFileSelect(file);
                }
              }}
            />

            {/* Preview zone */}
            <form.Field
              name="file"
              validators={{
                onChange: ({ value }) => {
                  if (!value) return undefined;
                  if (!ALLOWED_TYPES.includes(value.type))
                    return "Format non supporté";
                  if (value.size > MAX_SIZE)
                    return "Fichier trop lourd (max 25 Mo)";
                  return undefined;
                },
              }}
            >
              {(field) => (
                <Field.Root invalid={!!field.state.meta.errors?.length}>
                  {previewUrl ? (
                    <Box
                      position="relative"
                      w="100%"
                      aspectRatio="1"
                      rounded="xl"
                      overflow="hidden"
                      bg="black"
                      cursor="pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {isVideo ? (
                        <video
                          src={previewUrl}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={previewUrl}
                          alt="Preview"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      )}
                      <Button
                        position="absolute"
                        top="2"
                        right="2"
                        size="sm"
                        rounded="full"
                        colorPalette="red"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearFile();
                        }}
                      >
                        <LuX />
                      </Button>
                    </Box>
                  ) : (
                    <Box
                      w="100%"
                      aspectRatio="1"
                      rounded="xl"
                      border="2px dashed"
                      borderColor="primary.300"
                      bg="primary.50"
                      _dark={{ bg: "primary.950", borderColor: "primary.700" }}
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="center"
                      gap="3"
                      cursor="pointer"
                      _hover={{ borderColor: "primary.500" }}
                      transition="all 0.15s"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Icon as={LuCamera} boxSize="12" color="primary.400" />
                      <Text fontWeight="bold" fontSize="sm" color="primary.fg">
                        Ajouter une photo ou vidéo
                      </Text>
                    </Box>
                  )}
                  <Field.ErrorText>
                    {field.state.meta.errors?.join(", ")}
                  </Field.ErrorText>
                </Field.Root>
              )}
            </form.Field>

            {/* Comment */}
            <form.Field name="comment">
              {(field) => (
                <Textarea
                  placeholder="Décrivez ce moment..."
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  rows={3}
                  resize="none"
                />
              )}
            </form.Field>

            <HStack justify="center" gap="3" color="fg.subtle" fontSize="xs">
              <HStack gap="1">
                <Icon as={LuImage} boxSize="3" /> <Text>Image</Text>
              </HStack>
              <Text>·</Text>
              <HStack gap="1">
                <Icon as={LuVideo} boxSize="3" /> <Text>Vidéo</Text>
              </HStack>
              <Text>· max 25 Mo</Text>
            </HStack>

            {error && (
              <HStack
                color="red.500"
                gap="2"
                justify="center"
                p="3"
                bg="red.50"
                rounded="md"
                borderWidth="1px"
                borderColor="red.100"
              >
                <Icon as={LuCircleAlert} />
                <Text fontSize="sm" fontWeight="medium">
                  {error}
                </Text>
              </HStack>
            )}

            <Button
              type="submit"
              size="lg"
              w="full"
              fontWeight="bold"
              colorPalette="primary"
              loading={uploadMutation.isPending}
              disabled={!form.state.values.file}
            >
              <LuSend /> Partager maintenant
            </Button>
          </VStack>
        </form>
      </Container>
    </Box>
  );
}

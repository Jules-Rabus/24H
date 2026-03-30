"use client";

import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Textarea,
  Stack,
  Text,
  VStack,
  HStack,
  Icon,
  Field,
} from "@chakra-ui/react";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUploadRaceMediaMutation } from "@/state/media/mutations";
import { ColorModeButton } from "../../components/ui/color-mode";
import {
  LuCamera,
  LuCircleCheck,
  LuCircleAlert,
  LuArrowLeft,
} from "react-icons/lu";

export default function UploadPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
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
        if (value.file) {
          formData.append("file", value.file);
        }
        if (value.comment) {
          formData.append("comment", value.comment);
        }
        await uploadMutation.mutateAsync(formData);
        setSuccess(true);
      } catch {
        setError("Erreur lors de l'envoi. Veuillez réessayer.");
      }
    },
  });

  return (
    <Box bg="bg.canvas" minH="100vh" colorPalette="primary">
      {/* En-tête minimaliste */}
      <Box
        as="header"
        bg="bg.panel"
        borderBottomWidth="1px"
        borderColor="border.subtle"
        mb="8"
      >
        <Container maxW="container.md" py="4">
          <HStack justify="space-between">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <LuArrowLeft /> Retour
            </Button>
            <ColorModeButton />
          </HStack>
        </Container>
      </Box>

      <Container maxW="md" pb="24">
        <VStack
          bg="bg.panel"
          p={{ base: "6", md: "10" }}
          shadow="lg"
          borderRadius="2xl"
          borderWidth="1px"
          borderColor="border.subtle"
          gap="8"
          align="stretch"
        >
          <VStack textAlign="center" gap="2">
            <Icon as={LuCamera} boxSize="12" color="colorPalette.fg" mb="2" />
            <Heading
              size="2xl"
              fontWeight="black"
              letterSpacing="tighter"
              textTransform="uppercase"
            >
              Partagez l'Action
            </Heading>
            <Text color="fg.muted">
              Prenez une photo pour la galerie publique du défi 24H !
            </Text>
          </VStack>

          {success ? (
            <VStack textAlign="center" py="10" gap="6">
              <Icon as={LuCircleCheck} boxSize="16" color="green.500" />
              <Box>
                <Text fontWeight="bold" fontSize="xl" mb="2">
                  Photo envoyée !
                </Text>
                <Text color="fg.muted">
                  Merci pour votre contribution à l'événement.
                </Text>
              </Box>
              <Button
                w="full"
                size="lg"
                onClick={() => router.push("/gallery")}
              >
                Voir la galerie
              </Button>
              <Button
                variant="outline"
                w="full"
                onClick={() => router.push("/public-race-status")}
              >
                Tableau de bord
              </Button>
              <Button
                variant="ghost"
                w="full"
                onClick={() => {
                  setSuccess(false);
                  form.reset();
                }}
              >
                Envoyer une autre photo
              </Button>
            </VStack>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
            >
              <Stack gap="6">
                <form.Field
                  name="file"
                  validators={{
                    onChange: ({ value }) => {
                      if (!value) return "Photo requise";
                      const allowed = [
                        "image/jpeg",
                        "image/png",
                        "image/gif",
                        "image/webp",
                        "image/heic",
                        "image/heif",
                      ];
                      if (!allowed.includes(value?.type ?? ""))
                        return "Format non supporté (JPEG, PNG, GIF, WebP, HEIC)";
                      return undefined;
                    },
                  }}
                >
                  {(field) => (
                    <Field.Root invalid={!!field.state.meta.errors?.length}>
                      <Field.Label
                        fontWeight="bold"
                        fontSize="sm"
                        textTransform="uppercase"
                        letterSpacing="wider"
                      >
                        Votre photo
                      </Field.Label>
                      <Input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif"
                        capture="environment"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) field.handleChange(file);
                        }}
                        p="1"
                        h="auto"
                        bg="bg.canvas"
                        borderStyle="dashed"
                        borderWidth="2px"
                        _hover={{ borderColor: "colorPalette.fg" }}
                      />
                      <Field.HelperText fontSize="xs">
                        Formats acceptés : JPEG, PNG, GIF, WebP, HEIC.
                      </Field.HelperText>
                      <Field.ErrorText>
                        {field.state.meta.errors?.join(", ")}
                      </Field.ErrorText>
                    </Field.Root>
                  )}
                </form.Field>

                <form.Field name="comment">
                  {(field) => (
                    <Field.Root>
                      <Field.Label
                        fontWeight="bold"
                        fontSize="sm"
                        textTransform="uppercase"
                        letterSpacing="wider"
                      >
                        Commentaire{" "}
                        <Text
                          as="span"
                          color="fg.subtle"
                          fontWeight="normal"
                          textTransform="none"
                        >
                          (optionnel)
                        </Text>
                      </Field.Label>
                      <Textarea
                        placeholder="Décrivez ce moment..."
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        rows={3}
                        resize="none"
                        bg="bg.canvas"
                      />
                    </Field.Root>
                  )}
                </form.Field>

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
                  mt="4"
                  type="submit"
                  size="lg"
                  w="full"
                  fontWeight="black"
                  textTransform="uppercase"
                  letterSpacing="widest"
                  loading={uploadMutation.isPending}
                  disabled={!form.state.canSubmit}
                >
                  {uploadMutation.isPending
                    ? "Envoi en cours..."
                    : "Envoyer la photo"}
                </Button>
              </Stack>
            </form>
          )}
        </VStack>
      </Container>
    </Box>
  );
}

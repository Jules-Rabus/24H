"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  Container,
  Field,
  Heading,
  Input,
  Separator,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useForm } from "@tanstack/react-form";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { useResetPasswordMutation } from "@/state/auth/mutations";
import { toaster } from "../../components/ui/toaster";

const MotionBox = motion.create(Box);

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const resetMutation = useResetPasswordMutation();

  const form = useForm({
    defaultValues: {
      email: "",
    },
    onSubmit: async ({ value }) => {
      try {
        await resetMutation.mutateAsync(value);
      } catch (err) {
        console.error("[forgot-password] reset error:", err);
        toaster.create({
          title: "Erreur",
          description: "Une erreur est survenue. Veuillez réessayer.",
          type: "error",
          closable: true,
        });
      } finally {
        setSuccess(true);
      }
    },
  });

  return (
    <Box
      minH="100vh"
      bg="bg.subtle"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px="4"
    >
      <Container maxW="sm" p="0">
        <MotionBox
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {/* Back link */}
          <Button
            variant="plain"
            size="sm"
            colorPalette="primary"
            color="colorPalette.fg"
            onClick={() => router.push("/login")}
            mb="6"
            p="0"
            h="auto"
            fontWeight="normal"
          >
            ← Retour à la connexion
          </Button>

          {/* Header */}
          <Stack align="center" mb="8" gap="1">
            <Box
              px="3"
              py="1"
              bg="colorPalette.muted"
              rounded="full"
              colorPalette="primary"
              mb="3"
            >
              <Text
                fontSize="xs"
                fontWeight="semibold"
                color="colorPalette.fg"
                letterSpacing="wider"
                textTransform="uppercase"
              >
                Défi des 24h
              </Text>
            </Box>
            <Heading size="2xl" fontWeight="bold" textAlign="center">
              Mot de passe oublié
            </Heading>
            <Text color="fg.muted" textAlign="center" fontSize="sm">
              Entrez votre email pour recevoir un lien de réinitialisation.
            </Text>
          </Stack>

          {/* Card */}
          <Card.Root variant="outline" shadow="sm" borderColor="border.subtle">
            <Card.Body p="8">
              {success ? (
                <Stack gap="5">
                  <Alert.Root status="success">
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Title>Email envoyé</Alert.Title>
                      <Alert.Description>
                        Si un compte existe avec cette adresse, vous recevrez un
                        lien de réinitialisation dans quelques minutes.
                      </Alert.Description>
                    </Alert.Content>
                  </Alert.Root>
                  <Separator />
                  <Button
                    size="lg"
                    variant="outline"
                    colorPalette="primary"
                    w="full"
                    onClick={() => router.push("/login")}
                  >
                    Retour à la connexion
                  </Button>
                </Stack>
              ) : (
                <Box
                  as="form"
                  onSubmit={(e: React.FormEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                  }}
                >
                  <Stack gap="5">
                    <form.Field
                      name="email"
                      validators={{
                        onChange: ({ value }) => {
                          const parsed = z
                            .string()
                            .email("Adresse email invalide")
                            .safeParse(value);
                          return parsed.success
                            ? undefined
                            : parsed.error.issues[0].message;
                        },
                      }}
                    >
                      {(field) => (
                        <Field.Root
                          invalid={
                            field.state.meta.isTouched &&
                            field.state.meta.errors.length > 0
                          }
                        >
                          <Field.Label fontSize="sm" fontWeight="medium">
                            Email
                          </Field.Label>
                          <Input
                            type="email"
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="vous@exemple.fr"
                            size="lg"
                          />
                          <Field.ErrorText fontSize="xs">
                            {field.state.meta.errors[0]}
                          </Field.ErrorText>
                        </Field.Root>
                      )}
                    </form.Field>

                    <Separator />

                    <Button
                      type="submit"
                      size="lg"
                      colorPalette="primary"
                      w="full"
                      loading={form.state.isSubmitting}
                      loadingText="Envoi en cours..."
                      disabled={!form.state.canSubmit}
                    >
                      Réinitialiser le mot de passe
                    </Button>
                  </Stack>
                </Box>
              )}
            </Card.Body>
          </Card.Root>
        </MotionBox>
      </Container>
    </Box>
  );
}

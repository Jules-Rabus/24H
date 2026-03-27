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
import { useLoginMutation } from "@/state/auth/mutations";
import { PasswordInput } from "@/components/ui/password-input";

const MotionBox = motion.create(Box);

export default function LoginPage() {
  const [error, setError] = useState("");
  const router = useRouter();
  const loginMutation = useLoginMutation();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setError("");
      try {
        await loginMutation.mutateAsync(value);
        router.push("/");
      } catch {
        setError("Identifiants invalides. Veuillez réessayer.");
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
                24H Race
              </Text>
            </Box>
            <Heading size="2xl" fontWeight="bold" textAlign="center">
              Connexion
            </Heading>
            <Text color="fg.muted" textAlign="center" fontSize="sm">
              Accès réservé aux organisateurs
            </Text>
          </Stack>

          {/* Card */}
          <Card.Root variant="outline" shadow="sm" borderColor="border.subtle">
            <Card.Body p="8">
              <Box
                as="form"
                onSubmit={(e: React.FormEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit();
                }}
              >
                <Stack gap="5">
                  {/* Email field */}
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

                  {/* Password field */}
                  <form.Field
                    name="password"
                    validators={{
                      onChange: ({ value }) => {
                        const parsed = z
                          .string()
                          .min(1, "Le mot de passe est requis")
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
                        <Stack
                          direction="row"
                          justify="space-between"
                          align="baseline"
                        >
                          <Field.Label fontSize="sm" fontWeight="medium">
                            Mot de passe
                          </Field.Label>
                          <Button
                            variant="plain"
                            size="xs"
                            colorPalette="primary"
                            color="colorPalette.fg"
                            onClick={() => router.push("/forgot-password")}
                            type="button"
                            p="0"
                            h="auto"
                            fontWeight="normal"
                          >
                            Mot de passe oublié ?
                          </Button>
                        </Stack>
                        <PasswordInput
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="••••••••"
                          size="lg"
                          w="full"
                        />
                        <Field.ErrorText fontSize="xs">
                          {field.state.meta.errors[0]}
                        </Field.ErrorText>
                      </Field.Root>
                    )}
                  </form.Field>

                  {/* Error alert */}
                  {error && (
                    <Alert.Root status="error" size="sm">
                      <Alert.Indicator />
                      <Alert.Title>{error}</Alert.Title>
                    </Alert.Root>
                  )}

                  <Separator />

                  {/* Submit */}
                  <Button
                    type="submit"
                    size="lg"
                    colorPalette="primary"
                    w="full"
                    loading={form.state.isSubmitting}
                    loadingText="Connexion..."
                    disabled={!form.state.canSubmit}
                  >
                    Se connecter
                  </Button>
                </Stack>
              </Box>
            </Card.Body>
          </Card.Root>
        </MotionBox>
      </Container>
    </Box>
  );
}

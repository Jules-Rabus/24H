"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  Container,
  Field,
  Heading,
  Separator,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useForm } from "@tanstack/react-form";
import { motion } from "framer-motion";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useUpdatePasswordMutation } from "@/state/auth/mutations";
import { PasswordInput } from "@/components/ui/password-input";
import { toaster } from "../../../components/ui/toaster";

const MotionBox = motion.create(Box);

function extractApiError(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const response = (err as { response?: unknown }).response;
    if (response && typeof response === "object" && "data" in response) {
      const data = (response as { data?: unknown }).data;
      if (data && typeof data === "object") {
        // 422 constraint violations — pick plainPassword message first
        if (
          "violations" in data &&
          Array.isArray((data as { violations: unknown[] }).violations)
        ) {
          const violations = (
            data as {
              violations: Array<{ propertyPath?: string; message?: string }>;
            }
          ).violations;
          const pw = violations.find((v) => v.propertyPath === "plainPassword");
          const msg = pw?.message ?? violations[0]?.message;
          if (msg) return msg;
        }
        // Generic API error detail
        if (
          "detail" in data &&
          typeof (data as { detail: unknown }).detail === "string"
        ) {
          return (data as { detail: string }).detail;
        }
      }
    }
  }
  return "Le lien de réinitialisation est invalide ou expiré. Veuillez recommencer.";
}

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const updatePasswordMutation = useUpdatePasswordMutation();

  const form = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      try {
        await updatePasswordMutation.mutateAsync({
          token,
          password: value.password,
        });
        setSuccess(true);
      } catch (err) {
        console.error("[reset-password] error:", err);
        toaster.create({
          title: "Erreur",
          description: extractApiError(err),
          type: "error",
          closable: true,
        });
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
              Nouveau mot de passe
            </Heading>
            <Text color="fg.muted" textAlign="center" fontSize="sm">
              Choisissez un nouveau mot de passe pour votre compte.
            </Text>
          </Stack>

          <Card.Root variant="outline" shadow="sm" borderColor="border.subtle">
            <Card.Body p="8">
              {success ? (
                <Stack gap="5">
                  <Alert.Root status="success">
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Title>Mot de passe mis à jour</Alert.Title>
                      <Alert.Description>
                        Votre mot de passe a été réinitialisé avec succès. Vous
                        pouvez maintenant vous connecter.
                      </Alert.Description>
                    </Alert.Content>
                  </Alert.Root>
                  <Separator />
                  <Button
                    size="lg"
                    colorPalette="primary"
                    w="full"
                    onClick={() => router.push("/login")}
                  >
                    Se connecter
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
                      name="password"
                      validators={{
                        onChange: ({ value }) => {
                          const parsed = z
                            .string()
                            .min(8, "Au moins 8 caractères")
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
                            Nouveau mot de passe
                          </Field.Label>
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

                    <form.Field
                      name="confirmPassword"
                      validators={{
                        onChangeListenTo: ["password"],
                        onChange: ({ value, fieldApi }) => {
                          if (
                            value !== fieldApi.form.getFieldValue("password")
                          ) {
                            return "Les mots de passe ne correspondent pas";
                          }
                          return undefined;
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
                            Confirmer le mot de passe
                          </Field.Label>
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

                    <Separator />

                    <Button
                      type="submit"
                      size="lg"
                      colorPalette="primary"
                      w="full"
                      loading={form.state.isSubmitting}
                      loadingText="Mise à jour..."
                      disabled={!form.state.canSubmit}
                    >
                      Définir le nouveau mot de passe
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

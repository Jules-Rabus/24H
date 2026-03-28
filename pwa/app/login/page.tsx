"use client";

import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/api";

export default function LoginPage() {
  const [error, setError] = useState("");
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      try {
        const data = await login(value);
        localStorage.setItem("token", data.token);
        router.push("/dashboard");
      } catch (err) {
        setError("Login failed. Please check your credentials.");
      }
    },
  });

  return (
    <Container maxW="md" py={{ base: "12", md: "24" }}>
      <Stack p="8" bg="white" shadow="sm" borderRadius="xl">
        <Stack textAlign="center">
          <Heading size="xl" mb="2">
            Log in to your account
          </Heading>
          <Text color="gray.600">Welcome back! Please enter your details.</Text>
        </Stack>
        <Box
          as="form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <Stack mt="6">
            <form.Field
              name="email"
              validators={{
                onChange: ({ value }) => {
                  const parsed = z
                    .string()
                    .email("Invalid email address")
                    .safeParse(value);
                  return parsed.success
                    ? undefined
                    : parsed.error.issues[0].message;
                },
              }}
            >
              {(field) => (
                <Box>
                  <Text mb="1" fontWeight="medium" fontSize="sm">
                    Email
                  </Text>
                  <Input
                    type="email"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors ? (
                    <Text color="red.500" fontSize="sm" mt="1">
                      {field.state.meta.errors.join(", ")}
                    </Text>
                  ) : null}
                </Box>
              )}
            </form.Field>

            <form.Field
              name="password"
              validators={{
                onChange: ({ value }) => {
                  const parsed = z
                    .string()
                    .min(1, "Password is required")
                    .safeParse(value);
                  return parsed.success
                    ? undefined
                    : parsed.error.issues[0].message;
                },
              }}
            >
              {(field) => (
                <Box>
                  <Text mb="1" fontWeight="medium" fontSize="sm">
                    Password
                  </Text>
                  <Input
                    type="password"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors ? (
                    <Text color="red.500" fontSize="sm" mt="1">
                      {field.state.meta.errors.join(", ")}
                    </Text>
                  ) : null}
                </Box>
              )}
            </form.Field>

            <Button
              variant="plain"
              color="primary.600"
              size="sm"
              alignSelf="flex-start"
              onClick={() => router.push("/forgot-password")}
            >
              Forgot password?
            </Button>
          </Stack>

          {error && (
            <Text color="red.500" fontSize="sm" mt="4" textAlign="center">
              {error}
            </Text>
          )}

          <Button
            mt="8"
            type="submit"
            w="full"
            colorScheme="primary"
            disabled={!form.state.canSubmit}
          >
            Sign in
          </Button>
        </Box>
      </Stack>
    </Container>
  );
}

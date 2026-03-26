"use client"

import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react"
import { useForm } from "@tanstack/react-form"
import { z } from "zod"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { resetPassword } from "@/api"

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const form = useForm({
    defaultValues: {
      email: "",
    },
    onSubmit: async ({ value }) => {
      try {
        await resetPassword(value)
        setSuccess(true)
      } catch (err) {
        // Handle error implicitly as requested often for security
      }
    },
  })

  return (
    <Container maxW="md" py={{ base: "12", md: "24" }}>
      <Stack p="8" bg="white" shadow="sm" borderRadius="xl">
        <Stack textAlign="center">
          <Heading size="xl" mb="2">
            Forgot password
          </Heading>
          <Text color="gray.600">
            No worries, we'll send you reset instructions.
          </Text>
        </Stack>

        {success ? (
          <Box textAlign="center" mt="6">
            <Text color="green.600" mb="4">
              Check your email for a reset link.
            </Text>
            <Button w="full" onClick={() => router.push("/login")}>
              Back to log in
            </Button>
          </Box>
        ) : (
          <Box
            as="form"
            mt="6"
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
          >
            <Stack>
              <form.Field
                name="email"
                validators={{
                  onChange: ({ value }) => {
                     const parsed = z.string().email("Invalid email address").safeParse(value);
                     return parsed.success ? undefined : parsed.error.issues[0].message;
                  }
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

              <Button mt="8" type="submit" w="full" colorScheme="primary" disabled={!form.state.canSubmit}>
                Reset password
              </Button>

              <Button
                variant="plain"
                mt="4"
                w="full"
                onClick={() => router.push("/login")}
              >
                Back to log in
              </Button>
            </Stack>
          </Box>
        )}
      </Stack>
    </Container>
  )
}

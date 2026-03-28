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
import { useMutation, useQuery } from "@tanstack/react-query"
import { z } from "zod"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { fetchRunners, uploadRaceMedia } from "@/api"
import { QUERY_KEYS } from "@/state/queryKeys"

export default function UploadPage() {
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const { data: runners } = useQuery({ queryKey: QUERY_KEYS.RUNNERS, queryFn: fetchRunners })
  const uploadMutation = useMutation({ mutationFn: uploadRaceMedia })

  const form = useForm({
    defaultValues: {
      runnerIri: "",
      file: undefined as File | undefined,
    },
    onSubmit: async ({ value }) => {
      try {
        const formData = new FormData()
        formData.append("runner", value.runnerIri)
        if (value.file) {
          formData.append("file", value.file)
        }

        await uploadMutation.mutateAsync(formData)
        setSuccess(true)
      } catch (err) {
        setError("Erreur lors de l'upload. Veuillez réessayer.")
      }
    },
  })

  return (
    <Container maxW="md" py={{ base: "12", md: "24" }}>
      <Stack p="8" bg="white" shadow="sm" borderRadius="xl">
        <Stack textAlign="center">
          <Heading size="xl" mb="2">
            Partagez un moment
          </Heading>
          <Text color="gray.600">
            Prenez une photo d'un coureur en pleine action !
          </Text>
        </Stack>

        {success ? (
          <Box textAlign="center" mt="6">
            <Text color="green.600" mb="4">
              Photo uploadée avec succès ! Merci de votre contribution.
            </Text>
            <Button w="full" onClick={() => router.push("/public-race-status")}>
              Retourner au statut
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
                name="runnerIri"
                validators={{
                  onChange: ({ value }) => {
                     const parsed = z.string().min(1, "Veuillez sélectionner un coureur").safeParse(value);
                     return parsed.success ? undefined : parsed.error.issues[0].message;
                  }
                }}
              >
                {(field) => (
                  <Box>
                    <Text mb="1" fontWeight="medium" fontSize="sm">
                      Sélectionner le coureur
                    </Text>
                    <select style={{padding: "8px", width: "100%", border: "1px solid #e2e8f0", borderRadius: "0.375rem"}} value={field.state.value} onChange={(e: any) => field.handleChange(e.target.value)}>
                      <option value="">-- Choisissez un coureur --</option>
                      {runners?.['hydra:member']?.map((r: any) => (
                        <option key={r.id} value={`/users/${r.id}`}>{r.firstName} {r.lastName}</option>
                      ))}
                      <option value="/users/1">Jean Dupont</option>
                      <option value="/users/2">Marie Curie</option>
                    </select>
                    {field.state.meta.errors ? (
                      <Text color="red.500" fontSize="sm" mt="1">
                        {field.state.meta.errors.join(", ")}
                      </Text>
                    ) : null}
                  </Box>
                )}
              </form.Field>

              <form.Field
                name="file"
                validators={{
                  onChange: ({ value }) => {
                     const parsed = z.custom<File>((v) => v instanceof File, { message: "Photo requise" }).safeParse(value);
                     return parsed.success ? undefined : parsed.error.issues[0].message;
                  }
                }}
              >
                {(field) => (
                  <Box mt="4">
                    <Text mb="1" fontWeight="medium" fontSize="sm">
                      Prendre ou sélectionner une photo
                    </Text>
                    <Input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) field.handleChange(file)
                      }}
                      p="1"
                    />
                    {field.state.meta.errors ? (
                      <Text color="red.500" fontSize="sm" mt="1">
                        {field.state.meta.errors.join(", ")}
                      </Text>
                    ) : null}
                  </Box>
                )}
              </form.Field>

              {error && (
                <Text color="red.500" fontSize="sm" mt="4" textAlign="center">
                  {error}
                </Text>
              )}

              <Button mt="8" type="submit" w="full" colorScheme="primary" disabled={!form.state.canSubmit || uploadMutation.isPending}>
                {uploadMutation.isPending ? "Upload en cours..." : "Envoyer la photo"}
              </Button>
            </Stack>
          </Box>
        )}
      </Stack>
    </Container>
  )
}

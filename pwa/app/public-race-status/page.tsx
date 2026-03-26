"use client"

import {
  Box,
  Container,
  Heading,
  HStack,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react"
import { fetchWeather, fetchRaceStatus } from "@/api"
import { QUERY_KEYS } from "@/state/queryKeys"
import { useQuery } from "@tanstack/react-query"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useEffect, useState } from "react"
import { IScannerProps, Scanner } from "@yudiel/react-qr-scanner"
import { useRouter } from "next/navigation"

// Open-Meteo specific coordinates for "19 Rue Pierre Waguet, 60000 Beauvais"
const LATITUDE = 49.4326
const LONGITUDE = 2.0886

export default function PublicRaceStatusPage() {
  const router = useRouter()
  const { data: weatherData } = useQuery({ queryKey: QUERY_KEYS.WEATHER, queryFn: () => fetchWeather(LATITUDE, LONGITUDE) })
  const { data: raceData } = useQuery({ queryKey: QUERY_KEYS.RACE_STATUS, queryFn: fetchRaceStatus })

  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <Box bg="surface" minH="100vh" py="8">
      <Container maxW="container.xl">
        <HStack justify="space-between" mb="8" p="6" bg="white" rounded="xl" shadow="sm">
          <VStack align="start">
            <Heading size="lg" color="primary.900">Statut de la Course (En Direct)</Heading>
            <Text color="gray.600">UniLaSalle, Beauvais - Course de 24h</Text>
          </VStack>
          <VStack align="end">
            <Text fontSize="2xl" fontWeight="bold">{currentTime.toLocaleTimeString('fr-FR')}</Text>
            {weatherData && (
              <Text color="gray.600">
                Météo Actuelle : {weatherData.current.temperature_2m}°C
              </Text>
            )}
          </VStack>
        </HStack>

        <SimpleGrid columns={{ base: 1, lg: 3 }} gap="8">
          {/* Left Column: Recent Arrivals */}
          <VStack align="stretch" gap="4">
            <Box p="6" bg="white" rounded="xl" shadow="sm">
              <Heading size="md" mb="4">Derniers Arrivants (Boucle de 4km)</Heading>
              {raceData?.lastArrivals.map((runner: any) => (
                <HStack key={runner.id} justify="space-between" py="3" borderBottom="1px solid" borderColor="gray.100">
                  <VStack align="start" gap="0">
                    <Text fontWeight="semibold">{runner.name}</Text>
                    <Text fontSize="sm" color="gray.500">{runner.distance} km complétés</Text>
                  </VStack>
                  <Text fontWeight="bold" color="primary.600">{runner.time}</Text>
                </HStack>
              ))}
            </Box>

            <Box p="6" bg="surface-container-low" rounded="xl">
              <Heading size="sm" mb="4" color="on-surface">Envie de partager un moment ?</Heading>
              <Text fontSize="sm" color="on-surface-variant" mb="4">
                Scannez le QR Code depuis votre téléphone ou rendez-vous sur /upload pour ajouter une photo à la galerie de la course.
              </Text>
              <Box bg="white" p="4" rounded="md" textAlign="center">
                {/* Simulated QR Code for now since Yudiel QR Scanner is for reading, not generating */}
                <img style={{margin: "auto"}} src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=http://localhost:3000/upload" alt="QR Code" />
              </Box>
            </Box>
          </VStack>

          {/* Right Column: Chart */}
          <Box gridColumn={{ lg: "span 2" }} p="6" bg="white" rounded="xl" shadow="sm">
            <Heading size="md" mb="6">Temps Moyen par Boucle (Minutes)</Heading>
            <Box h="400px">
              {raceData && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={raceData.averageTimes} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="hour" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Line type="monotone" dataKey="avg" stroke="#0052cc" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  )
}

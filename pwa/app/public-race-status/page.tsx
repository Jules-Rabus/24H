"use client";

import {
  Box,
  Container,
  Heading,
  HStack,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWeatherQuery } from "@/state/weather/queries";
import { useParticipationsQuery, useRunsQuery } from "@/state/race/queries";

// Open-Meteo specific coordinates for "19 Rue Pierre Waguet, 60000 Beauvais"
const LATITUDE = 49.4326;
const LONGITUDE = 2.0886;

export default function PublicRaceStatusPage() {
  const router = useRouter();
  const { data: weatherData } = useWeatherQuery(LATITUDE, LONGITUDE);
  const { data: participations } = useParticipationsQuery();
  const { data: runs } = useRunsQuery();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Last 10 arrivals sorted by arrival time descending
  const lastArrivals = participations?.slice(0, 10) ?? [];

  // Average lap time per run for the chart
  const avgTimesData =
    runs?.map((run) => {
      const runParticipations =
        participations?.filter((p) => p.run?.endsWith(`/${run.id}`)) ?? [];
      const avgSec = runParticipations.length
        ? runParticipations.reduce((sum, p) => {
            const start = new Date(run.startDate ?? "").getTime();
            const end = p.arrivalTime
              ? new Date(p.arrivalTime).getTime()
              : start;
            return sum + (end - start) / 1000;
          }, 0) / runParticipations.length
        : 0;
      return {
        hour: new Date(run.startDate ?? "").toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        avg: Math.round(avgSec / 60),
      };
    }) ?? [];

  return (
    <Box bg="bg.subtle" minH="100vh" py="8">
      <Container maxW="container.xl">
        <HStack
          justify="space-between"
          mb="8"
          p="6"
          bg="white"
          rounded="xl"
          shadow="sm"
        >
          <VStack align="start">
            <Heading size="lg">Statut de la Course (En Direct)</Heading>
            <Text color="fg.muted">UniLaSalle, Beauvais - Course de 24h</Text>
          </VStack>
          <VStack align="end">
            <Text fontSize="2xl" fontWeight="bold">
              {currentTime.toLocaleTimeString("fr-FR")}
            </Text>
            {weatherData && (
              <Text color="fg.muted">
                Météo : {weatherData.current.temperature_2m}°C
              </Text>
            )}
          </VStack>
        </HStack>

        <SimpleGrid columns={{ base: 1, lg: 3 }} gap="8">
          {/* Left Column: Recent Arrivals */}
          <VStack align="stretch" gap="4">
            <Box p="6" bg="white" rounded="xl" shadow="sm">
              <Heading size="md" mb="4">
                10 Derniers Arrivants
              </Heading>
              {lastArrivals.length === 0 && (
                <Text color="fg.muted" fontSize="sm">
                  Aucun arrivant pour l&apos;instant.
                </Text>
              )}
              {lastArrivals.map((p) => (
                <HStack
                  key={p.id}
                  justify="space-between"
                  py="3"
                  borderBottom="1px solid"
                  borderColor="gray.100"
                >
                  <VStack align="start" gap="0">
                    <Text fontWeight="semibold">{p.user ?? "—"}</Text>
                  </VStack>
                  <Text fontWeight="bold" color="#0f929a">
                    {p.arrivalTime
                      ? new Date(p.arrivalTime).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </Text>
                </HStack>
              ))}
            </Box>

            <Box p="6" bg="white" rounded="xl" shadow="sm">
              <Heading size="sm" mb="4">
                Partager un moment
              </Heading>
              <Text fontSize="sm" color="fg.muted" mb="4">
                Rendez-vous sur /upload pour ajouter une photo à la galerie de
                la course.
              </Text>
              <Box bg="gray.50" p="4" rounded="md" textAlign="center">
                <img
                  style={{ margin: "auto" }}
                  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=http://localhost:3000/upload"
                  alt="QR Code vers /upload"
                />
              </Box>
            </Box>
          </VStack>

          {/* Right Column: Chart */}
          <Box
            gridColumn={{ lg: "span 2" }}
            p="6"
            bg="white"
            rounded="xl"
            shadow="sm"
          >
            <Heading size="md" mb="6">
              Temps Moyen par Boucle (Minutes)
            </Heading>
            <Box h="400px">
              {avgTimesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={avgTimesData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="hour" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: "transparent" }} />
                    <Line
                      type="monotone"
                      dataKey="avg"
                      stroke="#0f929a"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Text color="fg.muted" fontSize="sm">
                  Aucune donnée disponible.
                </Text>
              )}
            </Box>
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
}

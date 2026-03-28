"use client";

import {
  Box,
  Flex,
  Heading,
  HStack,
  Icon,
  Text,
  VStack,
  Badge,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  Scanner,
  IDetectedBarcode,
  IScannerProps,
} from "@yudiel/react-qr-scanner";
import axios from "axios";
import { LuScanLine, LuCircleCheck, LuCircleAlert, LuX } from "react-icons/lu";

interface Participation {
  id: number;
  arrivalTime?: string;
  totalTime?: number;
  user: { firstName: string; lastName: string };
  run: string;
  status: string;
}

type ToastType = "success" | "error";
interface Toast {
  message: string;
  type: ToastType;
  id: number;
}

const SCAN_FORMATS: IScannerProps["formats"] = ["data_matrix"];

function getDatamatrixOutline(
  detectedCodes: IDetectedBarcode[],
  ctx: CanvasRenderingContext2D,
) {
  for (const code of detectedCodes) {
    const [first, ...rest] = code.cornerPoints;
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#0f929a";
    ctx.beginPath();
    ctx.moveTo(first.x, first.y);
    for (const { x, y } of rest) ctx.lineTo(x, y);
    ctx.lineTo(first.x, first.y);
    ctx.closePath();
    ctx.stroke();
  }
}

export default function ScannerUI() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [lastArrivals, setLastArrivals] = useState<
    Array<{ name: string; time: string; totalTime?: number }>
  >([]);

  const addToast = (message: string, type: ToastType) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { message, type, id }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      5000,
    );
  };

  const handleScan = async (result: IDetectedBarcode[]) => {
    if (!result?.length) return;
    try {
      const { rawValue } = result[0];
      const { data } = await axios.post<Participation>(
        `${process.env.NEXT_PUBLIC_ENTRYPOINT}/participations/finished`,
        { rawValue },
        { withCredentials: true },
      );
      const arrivalTime = new Date(data.arrivalTime ?? Date.now());
      const timeStr = arrivalTime.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      const name = `${data.user.firstName} ${data.user.lastName}`;
      addToast(`Arrivée de ${name} à ${timeStr}`, "success");
      setLastArrivals((prev) => [
        { name, time: timeStr, totalTime: data.totalTime },
        ...prev.slice(0, 9),
      ]);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { description?: string } } })?.response
          ?.data?.description ?? "Erreur inconnue";
      addToast(msg, "error");
    }
  };

  return (
    <Flex direction="column" h="100vh" color="gray.100">
      {/* Header */}
      <Flex
        align="center"
        justify="space-between"
        px="6"
        py="3"
        flexShrink={0}
        borderBottomWidth="1px"
        borderColor="whiteAlpha.100"
        bg="blackAlpha.400"
      >
        <HStack gap="3">
          <Icon as={LuScanLine} boxSize="5" color="primary.400" />
          <Heading
            size="sm"
            fontWeight="900"
            letterSpacing="tighter"
            textTransform="uppercase"
            color="gray.100"
          >
            Scanner Arrivées
          </Heading>
        </HStack>
        <Badge
          colorPalette="primary"
          variant="outline"
          fontSize="9px"
          fontWeight="700"
        >
          DataMatrix
        </Badge>
      </Flex>

      {/* Main */}
      <Flex
        flex="1"
        overflow="hidden"
        direction={{ base: "column", md: "row" }}
      >
        {/* Camera */}
        <Box flex="1" overflow="hidden" position="relative" bg="black">
          <Scanner
            formats={SCAN_FORMATS}
            scanDelay={4000}
            onScan={handleScan}
            allowMultiple={true}
            sound={true}
            components={{
              torch: true,
              zoom: false,
              finder: true,
              onOff: true,
              tracker: getDatamatrixOutline,
            }}
            styles={{
              container: { width: "100%", height: "100%" },
            }}
          />
        </Box>

        {/* Dernières arrivées */}
        <Flex
          direction="column"
          w={{ base: "full", md: "280px" }}
          flexShrink={0}
          bg="gray.900"
          borderLeftWidth="1px"
          borderColor="whiteAlpha.100"
          overflow="hidden"
        >
          <Box
            px="4"
            py="3"
            borderBottomWidth="1px"
            borderColor="whiteAlpha.100"
          >
            <Text
              fontSize="9px"
              fontWeight="700"
              letterSpacing="0.15em"
              textTransform="uppercase"
              color="gray.500"
            >
              Dernières arrivées
            </Text>
          </Box>
          <VStack gap="0" flex="1" overflow="auto" align="stretch">
            {lastArrivals.length === 0 ? (
              <Flex
                align="center"
                justify="center"
                flex="1"
                color="gray.600"
                fontSize="xs"
              >
                Aucune arrivée enregistrée
              </Flex>
            ) : (
              lastArrivals.map((a, i) => (
                <HStack
                  key={i}
                  px="4"
                  py="3"
                  borderBottomWidth="1px"
                  borderColor="whiteAlpha.50"
                  bg={i === 0 ? "rgba(15,146,154,0.08)" : "transparent"}
                  justify="space-between"
                >
                  <Box>
                    <Text
                      fontSize="sm"
                      fontWeight="700"
                      color={i === 0 ? "primary.300" : "gray.200"}
                    >
                      {a.name}
                    </Text>
                    {a.totalTime != null && (
                      <Text fontSize="10px" color="gray.500">
                        {Math.floor(a.totalTime / 60)}m
                        {String(a.totalTime % 60).padStart(2, "0")}s
                      </Text>
                    )}
                  </Box>
                  <Text
                    fontSize="xs"
                    fontWeight="700"
                    color="gray.400"
                    fontVariantNumeric="tabular-nums"
                  >
                    {a.time}
                  </Text>
                </HStack>
              ))
            )}
          </VStack>
        </Flex>
      </Flex>

      {/* Toasts */}
      <Box
        position="fixed"
        top="4"
        left="50%"
        style={{ transform: "translateX(-50%)" }}
        zIndex={1000}
        w="max-content"
        maxW="90vw"
      >
        <VStack gap="2">
          {toasts.map((t) => (
            <HStack
              key={t.id}
              px="4"
              py="3"
              rounded="xl"
              bg={t.type === "success" ? "green.900" : "red.900"}
              borderWidth="1px"
              borderColor={t.type === "success" ? "green.700" : "red.700"}
              shadow="xl"
              gap="3"
              minW="280px"
            >
              <Icon
                as={t.type === "success" ? LuCircleCheck : LuCircleAlert}
                boxSize="4"
                color={t.type === "success" ? "green.400" : "red.400"}
                flexShrink={0}
              />
              <Text fontSize="sm" fontWeight="600" color="gray.100" flex="1">
                {t.message}
              </Text>
              <Icon
                as={LuX}
                boxSize="3"
                color="gray.500"
                cursor="pointer"
                flexShrink={0}
                onClick={() =>
                  setToasts((prev) => prev.filter((x) => x.id !== t.id))
                }
              />
            </HStack>
          ))}
        </VStack>
      </Box>
    </Flex>
  );
}

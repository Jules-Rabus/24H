"use client";

import {
  Box,
  Flex,
  Heading,
  HStack,
  Icon,
  Input,
  Text,
  VStack,
  Badge,
  Button,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import {
  Scanner,
  IDetectedBarcode,
  IScannerProps,
} from "@yudiel/react-qr-scanner";
import axios from "axios";
import {
  LuScanLine,
  LuCircleCheck,
  LuCircleAlert,
  LuX,
  LuHash,
} from "react-icons/lu";

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

const SCAN_FORMATS: IScannerProps["formats"] = ["qr_code"];

function getQrOutline(
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
  const [dossard, setDossard] = useState("");
  const dossardRef = useRef<HTMLInputElement>(null);

  const addToast = (message: string, type: ToastType) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { message, type, id }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      5000,
    );
  };

  const processRawValue = async (rawValue: string) => {
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
  };

  const handleScan = async (result: IDetectedBarcode[]) => {
    if (!result?.length) return;
    try {
      await processRawValue(result[0].rawValue);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { description?: string } } })?.response
          ?.data?.description ?? "Erreur inconnue";
      addToast(msg, "error");
    }
  };

  const handleDossardSubmit = async () => {
    const num = parseInt(dossard, 10);
    if (!num || num <= 0) return;
    try {
      await processRawValue(JSON.stringify({ originId: num }));
      setDossard("");
      dossardRef.current?.focus();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { description?: string } } })?.response
          ?.data?.description ?? "Erreur inconnue";
      addToast(msg, "error");
    }
  };

  return (
    <Flex direction="column" h="100dvh" color="gray.100" overflow="hidden">
      {/* Header */}
      <Flex
        align="center"
        justify="space-between"
        px="4"
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
          QR Code
        </Badge>
      </Flex>

      {/* Main — colonne sur mobile, ligne sur desktop */}
      <Flex
        flex="1"
        overflow="hidden"
        direction={{ base: "column", md: "row" }}
        minH={0}
      >
        {/* Caméra */}
        <Box flex="1" overflow="hidden" position="relative" bg="black" minH={0}>
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
              tracker: getQrOutline,
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
          maxH={{ base: "180px", md: "none" }}
          flexShrink={0}
          bg="gray.900"
          borderLeftWidth={{ base: "0", md: "1px" }}
          borderTopWidth={{ base: "1px", md: "0" }}
          borderColor="whiteAlpha.100"
          overflow="hidden"
        >
          <Box
            px="4"
            py="2"
            borderBottomWidth="1px"
            borderColor="whiteAlpha.100"
            flexShrink={0}
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
                py="3"
              >
                Aucune arrivée enregistrée
              </Flex>
            ) : (
              lastArrivals.map((a, i) => (
                <HStack
                  key={i}
                  px="4"
                  py="2"
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

      {/* Barre saisie manuelle — fixe en bas */}
      <HStack
        flexShrink={0}
        px="4"
        py="3"
        gap="2"
        borderTopWidth="1px"
        borderColor="whiteAlpha.100"
        bg="gray.900"
      >
        <Icon as={LuHash} boxSize="4" color="gray.500" flexShrink={0} />
        <Input
          ref={dossardRef}
          type="number"
          inputMode="numeric"
          placeholder="N° dossard"
          value={dossard}
          onChange={(e) => setDossard(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleDossardSubmit()}
          size="sm"
          bg="whiteAlpha.100"
          border="1px solid"
          borderColor="whiteAlpha.200"
          color="gray.100"
          _placeholder={{ color: "gray.500" }}
          rounded="lg"
          flex="1"
        />
        <Button
          size="sm"
          colorPalette="primary"
          variant="solid"
          onClick={handleDossardSubmit}
          disabled={!dossard || parseInt(dossard, 10) <= 0}
          flexShrink={0}
        >
          Valider
        </Button>
      </HStack>

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

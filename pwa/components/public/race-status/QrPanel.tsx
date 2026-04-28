"use client";

import { Box, Flex, Icon, Text } from "@chakra-ui/react";
import { LuQrCode } from "react-icons/lu";

export function QrPanel() {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      gap="3"
      p="5"
      bg="gray.900"
    >
      <Icon as={LuQrCode} boxSize="7" color="primary.400" />
      <Text
        fontSize="xs"
        fontWeight="700"
        letterSpacing="0.2em"
        textTransform="uppercase"
        color="gray.500"
      >
        Photo Wall
      </Text>
      <Text
        fontSize="xl"
        fontWeight="900"
        letterSpacing="tight"
        textTransform="uppercase"
        color="gray.100"
        textAlign="center"
        lineHeight="1.2"
      >
        PARTAGEZ
        <br />
        VOTRE MOMENT
      </Text>
      <Box bg="white" p="2" rounded="xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${process.env.NEXT_PUBLIC_ENTRYPOINT}/upload`}
          alt="QR Code upload"
          width={110}
          height={110}
        />
      </Box>
      <Text
        fontSize="xs"
        color="primary.400"
        fontWeight="600"
        letterSpacing="0.1em"
        textTransform="uppercase"
      >
        Scannez pour uploader
      </Text>
    </Flex>
  );
}

import Image from "next/image";
import {
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  HStack,
  Link,
  Text,
  VStack,
} from "@chakra-ui/react";
import adminPicture from "../public/api-platform/admin.svg";
import mercurePicture from "../public/api-platform/mercure.svg";
import apiPicture from "../public/api-platform/api.svg";
import rocketPicture from "../public/api-platform/rocket.svg";
import logo from "../public/api-platform/logo_api-platform.svg";

const apiUrl = process.env.NEXT_PUBLIC_ENTRYPOINT ?? "";
// NEXT_PUBLIC_MERCURE_HUB_URL = https://localhost/.well-known/mercure
// Mercure UI is served at /.well-known/mercure/ui/
const mercureHubUrl = process.env.NEXT_PUBLIC_MERCURE_HUB_URL ?? "";
const mercureUiUrl = mercureHubUrl ? `${mercureHubUrl}/ui/` : "";

const services = [
  { image: apiPicture, title: "API", url: `${apiUrl}/docs` },
  { image: adminPicture, title: "Admin (nouveau)", url: "/admin" },
  { image: adminPicture, title: "Admin (legacy)", url: "/legacy/admin" },
  { image: rocketPicture, title: "Race Display", url: "/legacy/display" },
  { image: rocketPicture, title: "Race Hub Start", url: "/public-race-status" },
  {
    image: mercurePicture,
    title: "Mercure debugger",
    url: mercureUiUrl,
  },
];

export default function HubPage() {
  return (
    <Box w="full" overflowX="hidden">
      <style>{`
        .get-started-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: white;
          color: #0f929a;
          padding: 12px 32px;
          font-weight: 800;
          font-size: 1.125rem;
          position: relative;
          overflow: hidden;
          text-decoration: none;
          transition: padding 0.2s;
        }
        .get-started-btn:hover {
          padding-left: 16px;
          padding-right: 48px;
        }
        .get-started-btn .arrow-box {
          position: absolute;
          left: 100%;
          top: 0;
          width: 28px;
          height: 100%;
          background: #a5f3fc;
          display: flex;
          padding: 4px;
          justify-content: center;
          align-items: center;
          transition: transform 0.2s;
        }
        .get-started-btn:hover .arrow-box {
          transform: translateX(-100%);
        }
        .service-card {
          display: flex;
          align-items: center;
          width: 100%;
          box-shadow: 0px 0px 20px 0px rgba(0,0,0,0.15);
          padding: 12px;
          min-height: 96px;
          color: #46b6bf;
          border: 4px solid transparent;
          text-decoration: none;
          transition: border-color 0.15s, color 0.15s;
          flex-direction: column;
          justify-content: center;
        }
        @media (min-width: 640px) {
          .service-card {
            flex-direction: row;
            justify-content: flex-start;
            padding-left: 20px;
            padding-right: 20px;
          }
        }
        .service-card:hover {
          border-color: #bceff3;
          color: #0f929a;
        }
        .social-btn {
          display: flex;
          width: 36px;
          height: 36px;
          padding: 4px;
          border-radius: 50%;
          border: 2px solid #e5e7eb;
          justify-content: center;
          align-items: center;
          transition: all 0.15s;
          color: #46b6bf;
          text-decoration: none;
        }
        .social-btn:hover {
          border-color: #bceff3;
          background: rgba(188, 239, 243, 0.5);
        }
      `}</style>

      {/* Hero — teal with spider web SVG background */}
      <Box
        w="full"
        position="relative"
        bg="#0f929a"
        backgroundImage="url('/api-platform/web.svg')"
        backgroundSize="110%"
        backgroundPosition="center"
        backgroundRepeat="no-repeat"
      >
        <Container maxW="6xl" px={{ base: "4", md: "20" }} pt="24" pb="8">
          <Flex direction="row" align="flex-start">
            {/* Rocket illustration — hidden on mobile */}
            <Box
              display={{ base: "none", md: "block" }}
              position="relative"
              w="2/5"
              flexShrink={0}
              transform={{
                base: "none",
                lg: "none",
                md: "scaleX(1.5) scaleY(1.5)",
              }}
              transformOrigin="right"
            >
              <Image src={rocketPicture} alt="" />
            </Box>

            {/* Text content */}
            <VStack
              flex="1"
              align={{ base: "center", md: "flex-start" }}
              textAlign={{ base: "center", md: "left" }}
              gap="5"
            >
              <Heading as="h1" size="4xl" lineHeight="1.1">
                <Text
                  as="span"
                  display="block"
                  color="cyan.200"
                  fontWeight="bold"
                  fontSize="2xl"
                  mb="2"
                >
                  Welcome to
                </Text>
                <Image alt="API Platform" src={logo} />
              </Heading>

              <Text color="cyan.200" fontSize="lg">
                Ce conteneur héberge votre application{" "}
                <Link
                  href="https://nextjs.org/"
                  color="white"
                  fontWeight="bold"
                  _hover={{ bg: "#46b6bf" }}
                >
                  Next.js
                </Link>
                . Accédez aux outils de développement et de gestion ci-dessous.
              </Text>

              <a
                className="get-started-btn"
                href="https://api-platform.com/docs/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get started
                <span className="arrow-box">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    width="24"
                    height="24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.97 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06l6.22-6.22H3a.75.75 0 010-1.5h16.19l-6.22-6.22a.75.75 0 010-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </a>
            </VStack>
          </Flex>
        </Container>
      </Box>

      {/* Services section */}
      <Box bg="white" py="8">
        <Container maxW="6xl" px={{ base: "4", md: "20" }}>
          <Box ml={{ base: "0", lg: "auto" }} w={{ base: "full", lg: "3/5" }}>
            <Heading
              as="h2"
              fontSize="md"
              fontWeight="bold"
              mb="5"
              textAlign={{ base: "center", lg: "left" }}
            >
              Available services:
            </Heading>

            <Grid
              templateColumns={{ base: "1fr", sm: "1fr 1fr", lg: "1fr 1fr" }}
              gap="5"
              justifyItems={{ base: "center", lg: "start" }}
            >
              {services.map((service) => (
                <Box key={service.title} w="full" maxW="xs" p="2">
                  <a
                    className="service-card"
                    href={service.url}
                    target={
                      service.url.startsWith("http") ? "_blank" : undefined
                    }
                    rel={
                      service.url.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                  >
                    <Image src={service.image} width={50} height={50} alt="" />
                    <Text
                      textAlign={{ base: "center", sm: "left" }}
                      fontSize="base"
                      textTransform="uppercase"
                      fontWeight="semibold"
                      lineHeight="tight"
                      pt={{ base: "3", sm: "0" }}
                      pl={{ sm: "5" }}
                    >
                      {service.title}
                    </Text>
                  </a>
                </Box>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* Fixed side menu */}
      <Box
        display={{ base: "none", md: "grid" }}
        position="fixed"
        top="50%"
        right="-1"
        transform="translateY(-50%)"
        bg="white"
        boxShadow="md"
        px="0.5"
        py="4"
        gridTemplateColumns="1"
        gap="3"
        zIndex="10"
      >
        <Text
          color="#0f929a"
          fontWeight="normal"
          textTransform="uppercase"
          fontSize="xs"
          mx="2"
          textAlign="center"
        >
          Follow us
        </Text>

        {[
          {
            href: "https://twitter.com/ApiPlatform",
            title: "API Platform on Twitter",
            icon: (
              <svg
                viewBox="0 0 20 20"
                aria-hidden="true"
                fill="currentColor"
                width="20"
                height="20"
              >
                <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0 0 20 3.92a8.19 8.19 0 0 1-2.357.646 4.118 4.118 0 0 0 1.804-2.27 8.224 8.224 0 0 1-2.605.996 4.107 4.107 0 0 0-6.993 3.743 11.65 11.65 0 0 1-8.457-4.287 4.106 4.106 0 0 0 1.27 5.477A4.073 4.073 0 0 1 .8 7.713v.052a4.105 4.105 0 0 0 3.292 4.022 4.095 4.095 0 0 1-1.853.07 4.108 4.108 0 0 0 3.834 2.85A8.233 8.233 0 0 1 0 16.407a11.615 11.615 0 0 0 6.29 1.84" />
              </svg>
            ),
          },
          {
            href: "https://github.com/api-platform/api-platform",
            title: "API Platform on Github",
            icon: (
              <svg
                viewBox="0 0 16 16"
                fill="currentColor"
                aria-hidden="true"
                width="16"
                height="16"
              >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
            ),
          },
        ].map((item) => (
          <HStack key={item.href} justify="center">
            <a
              className="social-btn"
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              title={item.title}
            >
              {item.icon}
            </a>
          </HStack>
        ))}
      </Box>
    </Box>
  );
}

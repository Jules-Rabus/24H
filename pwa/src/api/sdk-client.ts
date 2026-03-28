/**
 * Initialise le client hey-api avec la baseURL et les cookies HttpOnly.
 * Le token JWT est envoyé automatiquement via le cookie BEARER.
 */
import { client } from "./generated/client.gen";

client.setConfig({
  baseURL: process.env.NEXT_PUBLIC_ENTRYPOINT ?? "http://localhost",
  throwOnError: true,
  withCredentials: true,
});

export { client };

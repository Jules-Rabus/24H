"use server";

import axios, { AxiosInstance } from 'axios';

const ENTRYPOINT = process.env.NEXT_PUBLIC_ENTRYPOINT;
const DISPLAY_EMAIL = process.env.DISPLAY_EMAIL;
const DISPLAY_PASSWORD = process.env.DISPLAY_PASSWORD;

console.log("ENTRYPOINT", ENTRYPOINT);
console.log("DISPLAY_EMAIL", DISPLAY_EMAIL);
console.log("DISPLAY_PASSWORD", DISPLAY_PASSWORD);

if (!ENTRYPOINT) throw new Error("NEXT_PUBLIC_ENTRYPOINT is not defined");
if (!DISPLAY_EMAIL) throw new Error("DISPLAY_EMAIL is not defined :(" + DISPLAY_EMAIL + ")");
if (!DISPLAY_PASSWORD) throw new Error("DISPLAY_PASSWORD is not defined");

let axiosInstance: AxiosInstance | null = null;

async function initAxiosInstance(): Promise<AxiosInstance> {
  if (axiosInstance) {
    return axiosInstance;
  }
  const loginResponse = await axios.post<{ token: string }>(
    `${ENTRYPOINT}/login`,
    {
      email: DISPLAY_EMAIL,
      password: DISPLAY_PASSWORD,
    }
  );
  const { token } = loginResponse.data;

  axiosInstance = axios.create({
    baseURL: ENTRYPOINT,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return axiosInstance;
}


export async function getUser(id: string): Promise<any> {
  const client = await initAxiosInstance();
  const response = await client.get(`/users/${id}`);
  return response.data;
}


export async function login(): Promise<{ token: string }> {
  const client = await initAxiosInstance();
  const response = await client.post<{ token: string }>(`/login`, {
    email: DISPLAY_EMAIL,
    password: DISPLAY_PASSWORD,
  });
  return response.data;
}

import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ENTRYPOINT ?? 'http://localhost',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

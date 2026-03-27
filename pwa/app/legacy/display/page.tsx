"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import Display from "./index";

type Run = {
  id: number;
  startDate: string;
  endDate: string;
  participations: [string];
  finishedParticipantsCount: number;
  inProgressParticipantsCount: number;
  participantsCount: number;
};

type Participation = {
  id: number;
  arrivalTime?: string;
  totalTime?: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    surname?: string;
    finishedParticipationsCount: number;
  };
  run: string;
  status: string;
};

const displayClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ENTRYPOINT ?? "",
  withCredentials: true,
});

export default function DisplayPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const email = process.env.NEXT_PUBLIC_DISPLAY_EMAIL ?? "";
    const password = process.env.NEXT_PUBLIC_DISPLAY_PASSWORD ?? "";

    async function load() {
      try {
        // Login sets the BEARER cookie automatically via Set-Cookie header
        await displayClient.post("/login", { email, password });

        const [runsResp, partResp] = await Promise.all([
          displayClient.get<{ member: Run[] }>("/runs", {
            params: { "order[startDate]": "asc" },
          }),
          displayClient.get<{ member: Participation[] }>("/participations", {
            params: { "order[arrivalTime]": "desc", itemsPerPage: 1000 },
          }),
        ]);

        setRuns(runsResp.data.member);
        setParticipations(
          partResp.data.member.filter((p) => p.status === "FINISHED"),
        );
      } catch (err) {
        console.error("[display] load error:", err);
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return <Display runs={runs} initialParticipations={participations} />;
}

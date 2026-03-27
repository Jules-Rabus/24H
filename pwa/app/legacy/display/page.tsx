"use client";

import axios from "axios";
import https from "https";
import { useEffect, useState } from "react";
import Display from "./index";

type Run = {
  id: number;
  startDate: string;
  endDate: string;
  participations: string[];
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

export default function DisplayPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const entrypoint = process.env.NEXT_PUBLIC_ENTRYPOINT ?? "";
    const email = process.env.NEXT_PUBLIC_DISPLAY_EMAIL ?? "";
    const password = process.env.NEXT_PUBLIC_DISPLAY_PASSWORD ?? "";

    async function load() {
      try {
        const loginResp = await axios.post<{ token: string }>(
          `${entrypoint}/login`,
          {
            email,
            password,
          },
        );
        const token = loginResp.data.token;
        const headers = { Authorization: `Bearer ${token}` };

        const [runsResp, partResp] = await Promise.all([
          axios.get<{ member: Run[] }>(`${entrypoint}/runs`, {
            headers,
            params: { "order[startDate]": "asc" },
          }),
          axios.get<{ member: Participation[] }>(
            `${entrypoint}/participations`,
            {
              headers,
              params: { "order[arrivalTime]": "desc", itemsPerPage: 1000 },
            },
          ),
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

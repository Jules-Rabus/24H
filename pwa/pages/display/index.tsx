import axios from "axios";
import https from "https";
import React, { useState, useEffect } from "react";
import Image from "next/image";

interface Run {
  id: number;
  startDate: string;
  endDate: string;
  participations: [string];
  finishedParticipantsCount: number;
  inProgressParticipantsCount: number;
  participantsCount: number;
}

interface Participation {
  id: number;
  arrivalTime?: string;
  totalTime?: number;
  user: User;
  run: string;
  status: string;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  surname?: string;
  finishedParticipationsCount: number;
}

interface DisplayProps {
  runs: Run[];
  initialParticipations: Participation[];
}

export async function getServerSideProps() {
  const { DISPLAY_EMAIL, DISPLAY_PASSWORD, NEXT_PUBLIC_ENTRYPOINT } =
    process.env;

  if (!DISPLAY_EMAIL || !DISPLAY_PASSWORD || !NEXT_PUBLIC_ENTRYPOINT) {
    throw new Error("Env variables are not set");
  }

  const httpsAgent = new https.Agent({
    rejectUnauthorized: process.env.NODE_ENV === "development" ? false : true,
  });

  const loginResp = await axios.post<{ token: string }>(
    `${NEXT_PUBLIC_ENTRYPOINT}/login`,
    {
      email: DISPLAY_EMAIL,
      password: DISPLAY_PASSWORD,
    },
    { httpsAgent },
  );

  const token = loginResp.data.token;
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const runsResp = await axios.get<{ member: Run[] }>(
    `${NEXT_PUBLIC_ENTRYPOINT}/runs?order[startDate]=asc`,
    { headers, httpsAgent },
  );

  const partResp = await axios.get<{
    member: Participation[];
  }>(`${NEXT_PUBLIC_ENTRYPOINT}/participations`, {
    headers,
    httpsAgent,
    params: {
      "order[arrivalTime]": "desc",
      itemsPerPage: 1000,
    },
  });

  return {
    props: {
      runs: runsResp.data.member,
      initialParticipations: partResp.data.member.filter(
        (p) => p.status === "FINISHED",
      ),
    },
  };
}

export default function Display({ runs, initialParticipations }: DisplayProps) {
  const [runsState, setRunsState] = useState<Run[]>(runs);
  const [participations, setParticipations] = useState<Participation[]>(
    initialParticipations,
  );
  const hubUrl = process.env.NEXT_PUBLIC_MERCURE_HUB_URL!;
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentRun, setCurrentRun] = useState<Run | null>(null);
  const [nextRun, setNextRun] = useState<Run | null>(null);
  const now = currentTime.getTime();

  useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const currentRun = runsState.find(
      (r: any) =>
        new Date(r.startDate).getTime() <= now &&
        now < new Date(r.endDate).getTime(),
    );

    const nextRun =
      runsState.find((r: any) => new Date(r.startDate).getTime() > now) || null;

    setNextRun(nextRun);

    if (currentRun) {
      setCurrentRun(currentRun);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runsState]);

  useEffect(() => {
    const url = new URL(hubUrl);
    url.searchParams.append(
      "topic",
      `${process.env.NEXT_PUBLIC_ENTRYPOINT}/participations/{id}`,
    );

    const eventSource = new EventSource(url.toString());
    eventSource.onmessage = async (e) => {
      const data: Participation = JSON.parse(e.data);

      const status = (data as any).status;
      if (data.status === "FINISHED") {
        const runId = parseInt(data.run.split("/").pop()!, 10);

        setRunsState((prev: any) =>
          prev.map((r: any) =>
            r.id === runId
              ? {
                  ...r,
                  finishedParticipantsCount: r.finishedParticipantsCount + 1,
                }
              : r,
          ),
        );

        setParticipations((prev: any) => [data, ...prev].slice(0, 10));

        if (currentRun?.id === runId) {
          setCurrentRun((r: any) =>
            r
              ? {
                  ...r,
                  finishedParticipantsCount: r.finishedParticipantsCount + 1,
                }
              : r,
          );
        }
      }
    };

    return () => eventSource.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();

  const nextDiffMs = nextRun
    ? Math.max(new Date(nextRun.startDate).getTime() - now, 0)
    : 0;
  const nextHours = Math.floor(nextDiffMs / (1000 * 3600)) % 24;
  const nextMinutes = Math.floor((nextDiffMs % (1000 * 3600)) / (1000 * 60));
  const nextSeconds = String(
    Math.floor((nextDiffMs % (1000 * 60)) / 1000),
  ).padStart(2, "0");

  return (
    <>
      <header>
        <div className="flex justify-between mb-8">
          <Image src="/logo.png" alt="Logo 24H" className="h-64" />
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-4xl mb-8">Défi 24h</h1>
            <div className="stat-value">
              <div className="flex gap-6 justify-center">
                <div className="flex flex-col items-center">
                  <span className="countdown text-4xl">
                    <span
                      style={{ "--value": hours } as React.CSSProperties}
                      aria-live="polite"
                      aria-label={`${hours} heures`}
                    />
                    <span className="hidden"> {hours}</span>
                  </span>
                  <span className="text-lg mt-1">h</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="countdown text-4xl">
                    <span
                      style={{ "--value": minutes } as React.CSSProperties}
                      aria-live="polite"
                      aria-label={`${minutes} minutes`}
                    />
                  </span>
                  <span className="text-lg mt-1">m</span>
                </div>
              </div>
            </div>
          </div>
          <Image src="/ASPO.jpeg" alt="Logo ASPO" className="h-64" />
        </div>
      </header>
      <div className="p-8">
        <div className="stats w-full shadow mb-8 text-center text-lg">
          <div className="stat">
            <div className="stat-title">Run en cours</div>
            <div className="stat-value">
              {currentRun
                ? `${new Date(currentRun.startDate).toLocaleTimeString(
                    "fr-FR",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )} – ${new Date(currentRun.endDate).toLocaleTimeString(
                    "fr-FR",
                    { hour: "2-digit", minute: "2-digit" },
                  )}`
                : "Pas de run actif"}
            </div>
            <div className="stat-desc">
              {currentRun &&
                (() => {
                  const idx = runs.findIndex((r) => r.id === currentRun.id);
                  return `Tour ${idx + 1} / ${runs.length}`;
                })()}
            </div>
          </div>

          <div className="stat">
            <div className="stat-title">Finishers / Total</div>
            <div className="stat-value">
              {currentRun
                ? `${currentRun.finishedParticipantsCount} / ${currentRun.participantsCount}`
                : "—"}
            </div>
            <div className="stat-desc">
              {currentRun ? (
                <span>
                  {currentRun.finishedParticipantsCount * 4} km parcourus
                </span>
              ) : (
                "—"
              )}
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">Prochain départ dans</div>
            <div className="stat-value">
              {nextRun ? (
                <div className="flex gap-6 justify-center">
                  <div className="flex flex-col items-center">
                    <span className="countdown text-4xl">
                      <span
                        style={{ "--value": nextHours } as React.CSSProperties}
                        aria-live="polite"
                        aria-label={`${nextHours} heures`}
                      />
                    </span>
                    <span className="text-lg">h</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="countdown text-4xl">
                      <span
                        style={
                          { "--value": nextMinutes } as React.CSSProperties
                        }
                        aria-live="polite"
                        aria-label={`${nextMinutes} minutes`}
                      />
                    </span>
                    <span className="text-lg">m</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="countdown text-4xl">{nextSeconds}</span>
                    <span className="text-lg">s</span>
                  </div>
                </div>
              ) : (
                "—"
              )}
            </div>
          </div>
        </div>

        <div className="mb-8 overflow-x-auto">
          <h2 className="text-2xl font-semibold mb-4">10 derniers arrivés</h2>
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Arrivée</th>
                <th>Prénom</th>
                <th>Nom</th>
                <th>Surnom</th>
                <th>Temps du run</th>
                <th>Total Km</th>
              </tr>
            </thead>
            <tbody>
              {participations
                .filter((p) => p.status === "FINISHED")
                .map((p) => (
                  <tr key={p.id}>
                    <td>
                      {new Date(p.arrivalTime!).toLocaleString("fr-FR", {
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td>{p.user.firstName}</td>
                    <td>{p.user.lastName}</td>
                    <td>{p.user.surname}</td>
                    <td>
                      {`${Math.floor(p.totalTime! / 3600)}h` +
                        String(Math.floor((p.totalTime! % 3600) / 60)).padStart(
                          2,
                          "0",
                        )}
                    </td>
                    <td>{p.user.finishedParticipationsCount * 4}</td>
                  </tr>
                ))}
              {participations.filter((p) => p.status === "FINISHED").length ===
                0 && (
                <tr>
                  <td colSpan={6} className="text-center">
                    Aucun coureur n&#39;est arrivé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

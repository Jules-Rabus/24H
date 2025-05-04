// pages/display/index.tsx

import axios from "axios";
import https from "https";
import React, { useState, useEffect } from "react";

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
      "pagination[limit]": 10,
    },
  });

  return {
    props: {
      runs: runsResp.data.member,
      initialParticipations: partResp.data.member,
    },
  };
}

export default function Display({ runs, initialParticipations }: DisplayProps) {
  const [participations, setParticipations] = useState<Participation[]>(
    initialParticipations,
  );
  const hubUrl = process.env.NEXT_PUBLIC_MERCURE_HUB_URL!;
  const [currentTime, setCurrentTime] = useState(new Date());
  const [now, setNow] = useState(0);
  const [newFinishedCount, setNewFinishedCount] = useState(0);
  const [currentRun, setCurrentRun] = useState<Run | null>(null);
  const [nextRun, setNextRun] = useState<Run | null>(null);
  const [fracCurrent, setFracCurrent] = useState(0);

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
      if (status === "FINISHED") {
        setNewFinishedCount((prev) => prev + 1);
        setParticipations((prev) => [data, ...prev].slice(0, 10));
      }
    };

    return () => eventSource.close();
  }, [hubUrl]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(new Date());
      setNow(now.getTime());
    }, 1000);

    const currentRun = runs.find(
      (r) =>
        new Date(r.startDate).getTime() <= now &&
        now < new Date(r.endDate).getTime(),
    );

    const nextRun =
      runs.find((r) => new Date(r.startDate).getTime() > now) || null;

    setFracCurrent(0);
    setNextRun(nextRun);
    setCurrentRun(nextRun);

    if (currentRun) {
      setCurrentRun(currentRun);
      const start = new Date(currentRun.startDate).getTime();
      const end = new Date(currentRun.endDate).getTime();
      const fracCurrent = (now - start) / (end - start);
      setFracCurrent(fracCurrent);
    }

    return () => clearInterval(timer);
  }, []);

  const totalKm =
    runs.reduce((sum, r) => sum + r.finishedParticipantsCount * 4, 0) +
    newFinishedCount * 4;

  const totalRuns = runs.length;

  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();

  const lastRun = runs.reduce((prev, curr) =>
    new Date(prev.endDate) > new Date(curr.endDate) ? prev : curr,
  );

  const targetTime = new Date(lastRun.endDate).getTime();
  const diffMs = Math.max(targetTime - currentTime.getTime(), 0);
  const remHours = Math.floor(diffMs / (1000 * 3600)) % 24;
  const remMinutes = Math.floor((diffMs % (1000 * 3600)) / (1000 * 60));
  const remSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  const nextDiffMs = nextRun
    ? Math.max(new Date(nextRun.startDate).getTime() - now, 0)
    : 0;
  const nextHours = Math.floor(nextDiffMs / (1000 * 3600)) % 24;
  const nextMinutes = Math.floor((nextDiffMs % (1000 * 3600)) / (1000 * 60));
  const nextSeconds = Math.floor((nextDiffMs % (1000 * 60)) / 1000);

  const completedRuns = runs.filter(
    (r) => new Date(r.endDate).getTime() <= now,
  ).length;

  const progressPct = ((completedRuns + fracCurrent) / (totalRuns - 1)) * 100;

  // @ts-ignore
  // @ts-ignore
  return (
    <div className="p-8">
      <div className="stats w-full shadow mb-8 text-center text-lg">
        <div className="stat">
          <div className="stat-title">Run en cours</div>
          <div className="stat-value">
            {currentRun
              ? `${new Date(currentRun.startDate).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })} – ${new Date(currentRun.endDate).toLocaleTimeString(
                  "fr-FR",
                  { hour: "2-digit", minute: "2-digit" },
                )}`
              : "Pas de run actif"}
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
                {currentRun.inProgressParticipantsCount * 4} km parcourus
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
              <div className="flex gap-4 justify-center">
                <div className="flex flex-col items-center">
                  <span className="countdown font-mono text-4xl">
                    <span
                      style={{ "--value": nextHours } as React.CSSProperties}
                      aria-live="polite"
                      aria-label={`${nextHours} heures`}
                    />
                  </span>
                  <span className="text-sm">h</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="countdown font-mono text-4xl">
                    <span
                      style={{ "--value": nextMinutes } as React.CSSProperties}
                      aria-live="polite"
                      aria-label={`${nextMinutes} minutes`}
                    />
                  </span>
                  <span className="text-sm">m</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="countdown font-mono text-4xl">
                    <span
                      style={{ "--value": nextSeconds } as React.CSSProperties}
                      aria-live="polite"
                      aria-label={`${nextSeconds} secondes`}
                    />
                  </span>
                  <span className="text-sm">s</span>
                </div>
              </div>
            ) : (
              "—"
            )}
          </div>
        </div>
      </div>
      <div className="relative h-4 bg-base-300 rounded-full mt-10 mb-18">
        <div
          className="absolute top-0 left-0 h-4 bg-primary rounded-full transition-all ease-linear duration-1000"
          style={{ width: `${progressPct}%` }}
        />

        {runs.map((run, idx) => {
          const leftPct = totalRuns > 1 ? (idx / (totalRuns - 1)) * 100 : 0;
          const isAbove = idx % 2 === 0;
          const timeLabel = new Date(run.startDate).toLocaleTimeString(
            "fr-FR",
            {
              hour: "2-digit",
              minute: "2-digit",
            },
          );

          return (
            <div
              key={run.id}
              className={`absolute transform -translate-x-2
              ${
                isAbove
                  ? "bottom-full -mb-3.5 flex flex-col-reverse items-center"
                  : "top-full -mt-3.5 flex flex-col items-center"
              }`}
              style={{ left: `${leftPct}%` }}
            >
              <div className="h-3 w-3 bg-white rounded-full" />
              <span className={`${isAbove ? "mb-4" : "mt-4"}`}>
                {run.finishedParticipantsCount} / {run.participantsCount}
              </span>
              <span className="">{timeLabel}</span>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-6 mb-8">
        <div className="flex items-center">
          <span className="h-2 w-2 bg-white rounded-full inline-block mr-2"></span>
          <span>Point = un départ</span>
        </div>
        <div>
          <span className="font-semibold">Chiffre</span> = nombre de finishers
        </div>
        <div>
          <span className="font-semibold">Heure</span> = hh:mm (départ)
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
                    <span>{Math.floor(p.totalTime! / 3600)}h</span>
                    <span>{Math.floor(p.totalTime! / 60) % 60}</span>
                  </td>
                  <td>{p.user.finishedParticipationsCount * 4}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="mx-auto pt-6">
        <div className="stats w-full shadow mb-8 text-center text-xl">
          <div className="stat">
            <div className="stat-title">Heure actuelle</div>
            <div className="stat-value">
              <div className="flex gap-4 justify-center">
                <div className="flex flex-col items-center">
                  <span className="countdown font-mono text-4xl">
                    <span
                      style={{ "--value": hours } as React.CSSProperties}
                      aria-live="polite"
                      aria-label={`${hours} heures`}
                    />
                  </span>
                  <span className="text-sm mt-1">h</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="countdown font-mono text-4xl">
                    <span
                      style={{ "--value": minutes } as React.CSSProperties}
                      aria-live="polite"
                      aria-label={`${minutes} minutes`}
                    />
                  </span>
                  <span className="text-sm mt-1">m</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="countdown font-mono text-4xl">
                    <span
                      style={{ "--value": seconds } as React.CSSProperties}
                      aria-live="polite"
                      aria-label={`${seconds} secondes`}
                    />
                  </span>
                  <span className="text-sm mt-1">s</span>
                </div>
              </div>
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">Total kilomètres</div>
            <div className="stat-value">{totalKm} km</div>
          </div>
          <div className="stat">
            <div className="stat-title">Temps restant</div>
            <div className="stat-value">
              <div className="flex gap-4 justify-center">
                <div className="flex flex-col items-center">
                  <span className="countdown font-mono text-4xl">
                    <span
                      style={{ "--value": remHours } as React.CSSProperties}
                      aria-live="polite"
                      aria-label={`${remHours} heures restantes`}
                    />
                  </span>
                  <span className="text-sm mt-1">h</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="countdown font-mono text-4xl">
                    <span
                      style={{ "--value": remMinutes } as React.CSSProperties}
                      aria-live="polite"
                      aria-label={`${remMinutes} minutes restantes`}
                    />
                  </span>
                  <span className="text-sm mt-1">m</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="countdown font-mono text-4xl">
                    <span
                      style={{ "--value": remSeconds } as React.CSSProperties}
                      aria-live="polite"
                      aria-label={`${remSeconds} secondes restantes`}
                    />
                  </span>
                  <span className="text-sm mt-1">s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

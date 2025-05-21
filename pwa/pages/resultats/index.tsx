"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import SearchForm from "../../components/classement/SearchForm";
import ParticipationCard from "../../components/classement/ParticipationCard";
import BibDownloadButton from "../../components/classement/BibDownloadButton";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ENTRYPOINT,
  headers: { Accept: "application/ld+json" },
});

export interface Run {
  id: number;
  startDate: string;
  endDate: string;
}

export interface Participation {
  id: number;
  arrivalTime: string | null;
  run: Run;
  status: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  surname?: string | null;
  organization?: string | null;
  participations: Participation[];
}

export default function Page() {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const qs = searchParams.toString();

  useEffect(() => {
    setIsLoading(true);
    const url = qs
      ? `/users/public?${qs}&itemsPerPage=100`
      : "/users/public?itemsPerPage=100";

    api
      .get(url)
      .then((r) => setUsers(r.data.member))
      .catch(() => setUsers([]))
      .finally(() => setIsLoading(false));
  }, [qs]);

  const stats = users.reduce(
    (acc, user) => {
      const finished = user.participations.filter(
        (p) => p.status === "FINISHED",
      );
      const km = finished.length * 4;
      const seconds = finished.reduce((sum, p) => {
        const start = new Date(p.run.startDate).getTime();
        const end = p.arrivalTime ? new Date(p.arrivalTime).getTime() : start;
        return sum + (end - start) / 1000;
      }, 0);
      return { km: acc.km + km, sec: acc.sec + seconds };
    },
    { km: 0, sec: 0 },
  );
  const totalKm = stats.km;
  const totalHours = (stats.sec / 3600).toFixed(2);

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 space-y-8">
      <h1 className="text-3xl font-extrabold text-center">Résultats</h1>

      <div className="stats border border-base-300  w-full">
        <div className="stat place-items-center">
          <div className="stat-title">Total parcouru (km)</div>
          <div className="stat-value">{totalKm}</div>
        </div>
        <div className="stat place-items-center">
          <div className="stat-title">Heures cumulées</div>
          <div className="stat-value">{totalHours}</div>
        </div>
      </div>

      <SearchForm />

      {isLoading ? (
        <div className="flex justify-center">
          <span className="loading loading-spinner"></span>
        </div>
      ) : users.length > 0 ? (
        <section className="space-y-4">
          {users.map((user) => {
            const finished = user.participations.filter(
              (p) => p.status === "FINISHED",
            );
            const totalKmUser = finished.length * 4;
            const totalSecUser = finished.reduce((sum, p) => {
              const start = new Date(p.run.startDate).getTime();
              const end = p.arrivalTime
                ? new Date(p.arrivalTime).getTime()
                : start;
              return sum + (end - start) / 1000;
            }, 0);
            const avgPace = totalKmUser
              ? `${Math.floor(totalSecUser / 60 / totalKmUser)}:${Math.round(
                  (totalSecUser / totalKmUser) % 60,
                )
                  .toString()
                  .padStart(2, "0")} min/km`
              : "—";

            return (
              <div key={user.id} className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title flex justify-between items-center">
                    <span>
                      {user.firstName} {user.lastName}
                      {user.surname && <span> ({user.surname})</span>}
                    </span>
                    {user.organization && (
                      <span className="text-sm opacity-70">
                        {user.organization}
                      </span>
                    )}
                  </h2>

                  <div className="mb-2 flex space-x-4">
                    <div>
                      Total:{" "}
                      <span className="font-semibold">{totalKmUser} km</span>
                    </div>
                    <div>
                      Allure moyenne:{" "}
                      <span className="font-semibold">{avgPace}</span>
                    </div>
                  </div>

                  <div className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-lg">
                    <input type="checkbox" />
                    <div className="collapse-title text-lg font-medium">
                      Voir participations
                    </div>
                    <div className="collapse-content space-y-4">
                      <BibDownloadButton user={user} />
                      {finished.length === 0 ? (
                        <p>Aucune participation terminée.</p>
                      ) : (
                        finished
                          .sort(
                            (a, b) =>
                              new Date(a.run.startDate).getTime() -
                              new Date(b.run.startDate).getTime(),
                          )
                          .map((p, idx) => (
                            <ParticipationCard
                              key={p.id}
                              participation={p}
                              index={idx}
                            />
                          ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      ) : (
        <p className="text-center">Aucun résultat…</p>
      )}
    </main>
  );
}

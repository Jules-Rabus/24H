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
  // @ts-ignore
  const qs = searchParams.toString();

  useEffect(() => {
    const url = qs
      ? `/users/public?${qs}&itemsPerPage=100`
      : "/users/public?itemsPerPage=100";
    api
      .get(url)
      .then((r) => setUsers(r.data.member))
      .catch(() => setUsers([]));
  }, [qs]);

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 space-y-8">
      <h1 className="text-3xl font-extrabold text-center">
        Classement des coureurs
      </h1>
      <SearchForm />
      {users.length > 0 ? (
        <section className="space-y-6">
          {users.map((user) => (
            <article key={user.id} className="card bg-base-200 shadow-xl">
              <div className="card-body space-y-4">
                <h2 className="card-title">
                  {user.firstName} {user.lastName}
                  {user.surname ? (
                    <span className="italic ml-2">({user.surname})</span>
                  ) : null}
                  <BibDownloadButton user={user} />
                </h2>
                {user.organization && (
                  <p className="text-sm opacity-70">{user.organization}</p>
                )}
                <div className="space-y-3">
                  {user.participations.length === 0 ? (
                    <p>Aucune participation enregistrée.</p>
                  ) : (
                    user.participations
                      .sort(
                        (a, b) =>
                          new Date(a.run.startDate).getTime() -
                          new Date(b.run.startDate).getTime(),
                      )
                      .map((participation, index) => (
                        <ParticipationCard
                          key={participation.id}
                          participation={participation}
                          index={index}
                        />
                      ))
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <p className="text-center">Aucun résultat…</p>
      )}
    </main>
  );
}

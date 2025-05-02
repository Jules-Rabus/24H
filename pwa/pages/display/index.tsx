import axios from 'axios';
import React, { useState, useEffect } from 'react';

interface Run {
  id: number;
  startDate: string;
  endDate: string;
  participations: unknown[];
}

interface Props {
  runs: Run[];
}

// Récupération des données côté serveur
export const getServerSideProps = async () => {
  const { DISPLAY_EMAIL, DISPLAY_PASSWORD, NEXT_PUBLIC_ENTRYPOINT } = process.env;
  if (!DISPLAY_EMAIL) throw new Error("DISPLAY_EMAIL is not set");
  if (!DISPLAY_PASSWORD) throw new Error("DISPLAY_PASSWORD is not set");
  if (!NEXT_PUBLIC_ENTRYPOINT) throw new Error("NEXT_PUBLIC_ENTRYPOINT is not set");

  // 1) Récupération du token
  const loginResp = await axios.post<{ token: string }>(
    `${NEXT_PUBLIC_ENTRYPOINT}/login`,
    { email: DISPLAY_EMAIL, password: DISPLAY_PASSWORD }
  );
  const token = loginResp.data.token;

  // 2) Récupération des runs
  const runsResp = await axios.get<Run[]>(
    `${NEXT_PUBLIC_ENTRYPOINT}/runs`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return {
    props: {
      runs: runsResp.data.member // data is in the 'member' property
    },
  };
};

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const calculateTimeLeft = () => {
    const difference = new Date(targetDate).getTime() - new Date().getTime();
    let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex space-x-4 text-center">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="flex-1">
          <div className="text-4xl font-bold">{String(value).padStart(2, '0')}</div>
          <div className="uppercase text-sm">{unit}</div>
        </div>
      ))}
    </div>
  );
}

export default function Display({runs}: Props) {
  const upcomingRuns = runs
    .filter(run => new Date(run.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  const nextRun = upcomingRuns[0];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Display</h1>

      {nextRun ? (
        <div className="card bg-base-100 shadow-xl p-6 mb-6">
          <h2 className="card-title mb-4">Prochain départ</h2>
          <CountdownTimer targetDate={nextRun.startDate} />
        </div>
      ) : (
        <div className="alert alert-info mb-6">Aucun départ à venir.</div>
      )}

      <h2 className="text-2xl font-semibold mb-2">Runs</h2>
      <ul className="space-y-4">
        {runs.map(run => (
          <li key={run.id} className="card bg-base-200 p-4 rounded-lg shadow">
            <h3 className="text-xl font-medium">
              {new Date(run.startDate).toLocaleString()} –{' '}
              {new Date(run.endDate).toLocaleString()}
            </h3>
            <p className="text-sm">Participations : {run.participations.length}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

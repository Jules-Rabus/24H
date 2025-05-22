import { Participation } from "../../pages/resultats";

type Props = { participation: Participation; index: number };

export default function ParticipationCard({ participation, index }: Props) {
  const start = new Date(participation.run.startDate);
  const end = participation.arrivalTime
    ? new Date(participation.arrivalTime)
    : undefined;
  const totalSec = end ? (end.getTime() - start.getTime()) / 1000 : undefined;
  const humanDuration =
    totalSec !== undefined
      ? `${Math.floor(totalSec / 60)} min ${Math.round(totalSec % 60)} s`
      : "⏱️ En cours";

  return (
    <div className="border rounded-lg shadow p-2 bg-gradient-to-r from-indigo-500 to-pink-500">
      <div className="text-xl font-semibold mb-2">
        Tour {index + 1} à{" "}
        {start.toLocaleString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
      <ul className="list-disc list-inside space-y-1">
        <li>
          Temps total : <span className="font-medium">{humanDuration}</span>
        </li>
        {end && (
          <>
            <li>
              Vitesse moyenne :{" "}
              <span className="font-medium">
                {((4 * 3600) / totalSec!).toFixed(2)} km/h
              </span>
            </li>
            <li>
              Allure :{" "}
              <span className="font-medium">
                {(() => {
                  const paceSec = Math.round(totalSec! / 4);
                  const paceMin = Math.floor(paceSec / 60);
                  const paceSecRem = paceSec % 60;
                  const secStr = String(paceSecRem).padStart(2, "0");
                  return `${paceMin}:${secStr} min/km`;
                })()}
              </span>
            </li>
          </>
        )}
      </ul>
    </div>
  );
}

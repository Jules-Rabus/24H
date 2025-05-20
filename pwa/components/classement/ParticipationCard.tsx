import { Participation } from "../../pages/classement";

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
    <div className="bg-gradient-to-b from-blue-500 to-red-200 text-white rounded-box">
      <div className="text-xl font-bold">
        Tour {index + 1} à{" "}
        {start.toLocaleString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
      <div className="text-neutral">
        <p className="font-semibold">
          • Temps total : <span className="font-normal">{humanDuration}</span>
        </p>
        {end && (
          <>
            <p className="font-semibold">
              • Vitesse moyenne :{" "}
              <span className="font-normal">
                {(3600 / totalSec!).toFixed(2)} km/h
              </span>
            </p>
            <p className="font-semibold">
              • Allure :{" "}
              <span className="font-normal">
                {(totalSec! / 60).toFixed(2)} min/km
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

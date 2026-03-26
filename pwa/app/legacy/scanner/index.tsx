import React, { useState, useEffect } from "react";
import {
  Scanner,
  IScannerProps,
  IDetectedBarcode,
} from "@yudiel/react-qr-scanner";
import axios from "axios";
import Link from "next/link";

interface Participation {
  id: number;
  arrivalTime?: string;
  totalTime?: number;
  user: {
    firstName: string;
    lastName: string;
  };
  run: string;
  status: string;
}

const SCAN_FORMATS: IScannerProps["formats"] = ["data_matrix"];
type Toast = { message: string; type: "success" | "error" };

export function getDatamatrixOutline(
  detectedCodes: IDetectedBarcode[],
  ctx: CanvasRenderingContext2D,
) {
  for (const detectedCode of detectedCodes) {
    const [firstPoint, ...otherPoints] = detectedCode.cornerPoints;

    ctx.lineWidth = 2;
    ctx.strokeStyle = "yellow";

    ctx.beginPath();
    ctx.moveTo(firstPoint.x, firstPoint.y);
    for (const { x, y } of otherPoints) {
      ctx.lineTo(x, y);
    }
    ctx.lineTo(firstPoint.x, firstPoint.y);
    ctx.closePath();
    ctx.stroke();
  }
}

export default function Scan() {
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  const [toast, setToast] = useState<Toast | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);
  const showToast = (message: string, type: Toast["type"] = "success") =>
    setToast({ message, type });

  const components = {
    audio: false,
    torch: true,
    zoom: false,
    finder: true,
    onOff: true,
    tracker: getDatamatrixOutline,
  };

  const handleScan = async (result: IDetectedBarcode[]) => {
    if (!result?.length) return;
    if (!token) {
      showToast("❌ Vous devez vous connecter (/admin#/login)", "error");
      return;
    }

    try {
      const { rawValue } = result[0];
      const { data } = await axios.post<Participation>(
        `${process.env.NEXT_PUBLIC_ENTRYPOINT}/participations/finished`,
        { rawValue },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const arrivalTime = new Date(
        data.arrivalTime ? data.arrivalTime : Date.now(),
      );
      showToast(
        `✅ Arrivée de ${data.user.firstName} ${data.user.lastName} enregistrée : ${arrivalTime.toLocaleString(
          "fr-FR",
          {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          },
        )}`,
        "success",
      );
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.description || "Erreur inconnue";
      showToast(`❌ ${msg}`, "error");
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex flex-col p-4">
      {token === "" || token === null ? (
        <div className="alert shadow-lg mb-4">
          <div>
            <span>
              Vous devez vous connecter sur{" "}
              <Link href="/admin#/login" className="link link-primary">
                /login
              </Link>
            </span>
          </div>
        </div>
      ) : null}

      <div className="card max-w-md shadow-lg bg-base-100 mx-auto">
        <div className="card-body">
          <h2 className="card-title">Scanner QR Code</h2>
          <p className="text-sm text-base-content/70 mb-4">
            Présentez le DataMatrix devant la caméra
          </p>
          <div className="overflow-hidden rounded-lg">
            <Scanner
              formats={SCAN_FORMATS}
              scanDelay={4000}
              onScan={handleScan}
              allowMultiple={true}
              sound={true}
              components={components}
            />
          </div>
        </div>
      </div>

      {toast && (
        <div className="toast toast-top toast-center">
          <div
            className={`alert ${
              toast.type === "success" ? "alert-success" : "alert-error"
            } shadow-lg`}
          >
            <div>
              <span>{toast.message}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

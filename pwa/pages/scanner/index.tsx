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
      showToast(
        `✅ Arrivée de ${data.user.firstName} ${data.user.lastName} enregistrée : ${data.arrivalTime}`,
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

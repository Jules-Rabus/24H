"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Field = "firstName" | "lastName" | "surname" | "organization";

const FIELDS: [Field, string][] = [
  ["firstName", "Prénom"],
  ["lastName", "Nom"],
  ["surname", "Surnom"],
  ["organization", "Organisation"],
];

export default function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const getParam = (k: Field) => searchParams.get(k) ?? "";

  const [values, setValues] = useState<Record<Field, string>>({
    firstName: getParam("firstName"),
    lastName: getParam("lastName"),
    surname: getParam("surname"),
    organization: getParam("organization"),
  });

  const buildQS = (v: Record<Field, string>) => {
    const p = new URLSearchParams();
    (Object.keys(v) as Field[]).forEach((k) => {
      const val = v[k].trim();
      if (val) p.append(k, val);
    });
    p.append("order[firstName]", "asc");
    p.append("order[lastName]", "asc");
    return p.toString();
  };

  const handleChange =
    (field: Field) =>
    (e: ChangeEvent<HTMLInputElement>): void =>
      setValues((prev) => ({ ...prev, [field]: e.target.value }));

  useEffect(() => {
    const id = setTimeout(() => {
      const qs = buildQS(values);
      if (qs !== searchParams.toString()) {
        router.replace(`/resultats?${qs}`);
      }
    }, 500);
    return () => clearTimeout(id);
  }, [values, router, searchParams]);

  useEffect(() => {
    const incoming: Record<Field, string> = {
      firstName: getParam("firstName"),
      lastName: getParam("lastName"),
      surname: getParam("surname"),
      organization: getParam("organization"),
    };
    const identical = (Object.keys(incoming) as Field[]).every(
      (k) => incoming[k] === values[k],
    );
    if (!identical) setValues(incoming);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="w-full mb-4">
      <div className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
        <input type="checkbox" />
        <div className="collapse-title text-lg font-medium">
          Filtres de recherche
        </div>
        <div className="collapse-content">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col sm:flex-row flex-wrap gap-3 w-full"
          >
            {FIELDS.map(([name, label]) => (
              <div key={name} className="form-control grow sm:max-w-xs">
                <label className="label">
                  <span className="label-text">{label}</span>
                </label>
                <input
                  className="input input-bordered w-full"
                  name={name}
                  value={values[name]}
                  onChange={handleChange(name)}
                  autoComplete="off"
                />
              </div>
            ))}
          </form>
        </div>
      </div>
    </div>
  );
}

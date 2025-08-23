"use client";

import { useEffect, useMemo, useState } from "react";
import { simulateShippingByCP } from "@/utils/shipping";

export default function ShippingCalculator({ onChange, initialCP = "" }) {
    const [cp, setCp] = useState(initialCP);
    const [result, setResult] = useState(null); // {valid, zone, cost, etaDays, note}
    const [touched, setTouched] = useState(false);

    // Calcula automáticamente al tener 5 dígitos
    useEffect(() => {
        if (/^\d{5}$/.test(cp)) {
            const r = simulateShippingByCP(cp);
            setResult(r);
            onChange?.(r.valid ? r.cost : 0, r);
        } else {
            setResult(null);
            onChange?.(0, null);
        }
    }, [cp, onChange]);

    const error = useMemo(() => {
        if (!touched) return "";
        if (!cp) return "Ingresa tu código postal";
        if (!/^\d{5}$/.test(cp)) return "El código postal debe tener 5 dígitos";
        return "";
    }, [cp, touched]);

    return (
        <div className="rounded-2xl border bg-white p-4 md:p-5">
            <div className="flex items-center justify-between">
                <h4 className="text-base md:text-lg font-semibold text-gray-900">Envío</h4>
                {result?.valid ? (
                    <span className="inline-flex items-center gap-2 text-sm text-gray-600">
            <Badge>{result.zone}</Badge>
            <span className="text-gray-500">•</span>
            <span>{result.etaDays}</span>
          </span>
                ) : null}
            </div>

            <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
                <input
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={5}
                    value={cp}
                    onChange={(e) => {
                        // Solo números
                        const v = e.target.value.replace(/\D/g, "").slice(0, 5);
                        setCp(v);
                    }}
                    onBlur={() => setTouched(true)}
                    placeholder="Código postal (5 dígitos)"
                    className={`w-full rounded-full border px-4 py-2.5 text-sm outline-none
                      ${error ? "border-red-300" : "border-gray-200"} focus:ring-2 focus:ring-brand-pink/30`}
                />
                <button
                    type="button"
                    onClick={() => {
                        setTouched(true);
                        if (/^\d{5}$/.test(cp)) {
                            const r = simulateShippingByCP(cp);
                            setResult(r);
                            onChange?.(r.valid ? r.cost : 0, r);
                        }
                    }}
                    className="rounded-full border px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
                >
                    Calcular
                </button>
            </div>

            {error ? (
                <p className="mt-2 text-xs text-red-600">{error}</p>
            ) : result?.valid ? (
                <p className="mt-2 text-sm text-gray-600">{result.note}</p>
            ) : null}

            {result?.valid ? (
                <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-gray-600">Costo de envío</span>
                    <span className="text-lg font-semibold text-gray-900">
            ${result.cost.toLocaleString("es-MX")}
          </span>
                </div>
            ) : null}
        </div>
    );
}

function Badge({ children }) {
    return (
        <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700">
      {children}
    </span>
    );
}
"use client";

import Link from "next/link";

export default function RamoPicker({ ramos, choice, onChange }) {
    const otherRamos = ramos.filter((r) => r.key !== "mother");

    return (
        <div className="rounded-2xl border bg-white p-4 sm:p-6">
            <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl md:text-3xl font-semibold">
                    Elige tu ramo
                </h2>
                <Link
                    href="/#productos"
                    className="text-sm underline whitespace-nowrap"
                >
                    ← Volver a productos
                </Link>
            </div>

            <p className="mt-1 text-sm text-gray-600">
                Puede variar según la disponibilidad, pero mantiene la misma
                esencia y apariencia.
            </p>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                {otherRamos.map((r) => {
                    const active = choice === r.key;

                    return (
                        <button
                            key={r.key}
                            type="button"
                            onClick={() => onChange(r.key)}
                            className={`group relative text-left rounded-2xl border overflow-hidden transition bg-white ${
                                active
                                    ? "border-black ring-1 ring-black"
                                    : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                            <div className="w-full overflow-hidden bg-[#faf7f5] aspect-[4/3]">
                                <img
                                    src={r.img}
                                    alt={r.name}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                                    loading="lazy"
                                    fetchPriority="low"
                                />
                            </div>

                            <div className="p-3 flex items-baseline justify-between gap-3">
                                <div className="text-lg font-serif">
                                    {r.name}
                                </div>
                                <div className="text-lg font-semibold whitespace-nowrap">
                                    ${r.price}
                                    <span className="text-[10px] align-super ml-1">
                                        MXN
                                    </span>
                                </div>
                            </div>

                            <div
                                className={`mx-3 mb-3 inline-flex items-center gap-2 rounded-full border px-4 py-1 text-sm transition ${
                                    active
                                        ? "bg-black text-white border-black"
                                        : "hover:bg-gray-50"
                                }`}
                            >
                                {active ? "Seleccionado" : "Elegir este ramo"}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

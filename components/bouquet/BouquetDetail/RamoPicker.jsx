"use client";

import Link from "next/link";

export default function RamoPicker({ ramos, choice, onChange }) {
    return (
        <div className="rounded-2xl border bg-white p-4 sm:p-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl md:text-3xl font-semibold">Elige tu ramo</h2>
                <Link href="/#productos" className="text-sm underline">← Volver a productos</Link>
            </div>
            <p className="mt-1 text-sm text-gray-600">
                Puede variar según la disponibilidad, pero mantiene la misma esencia y apariencia.
            </p>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                {ramos.map((r) => {
                    const active = choice === r.key;
                    return (
                        <button
                            key={r.key}
                            type="button"
                            onClick={() => onChange(r.key)}
                            className={`group text-left rounded-2xl border overflow-hidden transition ${
                                active ? "border-black" : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                            <div className="aspect-[4/3] w-full overflow-hidden">
                                <img
                                    src={r.img}
                                    alt={r.name}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                                    loading="lazy"
                                    fetchPriority="low"
                                />
                            </div>
                            <div className="p-3 flex items-baseline justify-between">
                                <div className="font-serif text-lg">{r.name}</div>
                                <div className="text-lg font-semibold">
                                    ${r.price}
                                    <span className="text-[10px] align-super ml-1">MXN</span>
                                </div>
                            </div>
                            <div
                                className={`mx-3 mb-3 inline-flex items-center gap-2 rounded-full border px-4 py-1 text-sm transition ${
                                    active ? "bg-black text-white border-black" : "hover:bg-gray-50"
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
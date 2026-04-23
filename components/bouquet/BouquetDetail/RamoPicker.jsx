"use client";

import Link from "next/link";

export default function RamoPicker({ ramos, choice, onChange }) {
    const motherRamo = ramos.find((r) => r.key === "mother");
    const otherRamos = ramos.filter((r) => r.key !== "mother");

    const renderRamo = (r, isMother = false) => {
        const active = choice === r.key;

        return (
            <button
                key={r.key}
                type="button"
                onClick={() => onChange(r.key)}
                className={`group relative text-left rounded-2xl border overflow-hidden transition bg-white ${
                    active
                        ? "border-black ring-1 ring-black"
                        : isMother
                            ? "border-gray-200 hover:border-gray-300"
                            : "border-gray-200 hover:border-gray-300"
                }`}
            >
                {isMother && (
                    <div className="absolute left-3 top-3 z-10 rounded-full bg-pink-600 text-white px-3 py-1 text-xs font-medium shadow-sm">
                        Edición limitada
                    </div>
                )}

                <div
                    className={`w-full overflow-hidden bg-[#faf7f5] ${
                        isMother ? "aspect-[5/3]" : "aspect-[4/3]"
                    }`}
                >
                    <img
                        src={r.img}
                        alt={r.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        loading="lazy"
                        fetchPriority="low"
                    />
                </div>

                <div className="p-3 flex items-baseline justify-between gap-3">
                    <div className={`${isMother ? "text-xl md:text-2xl" : "text-lg"} font-serif`}>
                        {r.name}
                    </div>
                    <div className={`${isMother ? "text-xl md:text-2xl" : "text-lg"} font-semibold whitespace-nowrap`}>
                        ${r.price}
                        <span className="text-[10px] align-super ml-1">MXN</span>
                    </div>
                </div>

                {isMother && (
                    <div className="px-3 pb-2">
                        <div className="rounded-xl px-3 py-3 text-sm text-gray-700 leading-relaxed">
                            <span className="font-medium text-gray-900">Edición limitada.</span>{" "}
                            Ramo grande con plantilla personalizada en tamaño chico.
                            <br />
                            Se entrega tal como aparece en la imagen y no incluye caja.
                        </div>
                    </div>
                )}

                <div
                    className={`mx-3 mb-3 inline-flex items-center gap-2 rounded-full border px-4 py-1 text-sm transition ${
                        active
                            ? "bg-black text-white border-black"
                            : isMother
                                ? "border-pink-300 text-pink-700 hover:bg-pink-50"
                                : "hover:bg-gray-50"
                    }`}
                >
                    {active ? "Seleccionado" : "Elegir este ramo"}
                </div>
            </button>
        );
    };

    return (
        <div className="rounded-2xl border bg-white p-4 sm:p-6">
            <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl md:text-3xl font-semibold">Elige tu ramo</h2>
                <Link href="/#productos" className="text-sm underline whitespace-nowrap">
                    ← Volver a productos
                </Link>
            </div>

            <p className="mt-1 text-sm text-gray-600">
                Puede variar según la disponibilidad, pero mantiene la misma esencia y apariencia.
            </p>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                {motherRamo && (
                    <div className="sm:col-span-2">
                        {renderRamo(motherRamo, true)}
                    </div>
                )}

                {otherRamos.map((r) => renderRamo(r, false))}
            </div>
        </div>
    );
}

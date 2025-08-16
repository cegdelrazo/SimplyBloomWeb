// components/bouquet/BouquetDetailClient.jsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

// IMPORTA los componentes auxiliares que ya creamos
import Hero from "@/components/bouquet/Hero";
import ThumbsWithLightbox from "@/components/bouquet/ThumbsWithLightbox";

// Opciones de ramo (temporal/estático)
const RAMOS = [
    { key: "rose", name: "RAMO ROSE", price: 800, img: "/media/bouquets/rose.webp" },
    { key: "lino", name: "RAMO LINO", price: 900, img: "/media/bouquets/lino.webp" },
];

export default function BouquetDetailClient({ product }) {
    if (!product) {
        return <main className="pt-24 container">No se encontró el producto.</main>;
    }

    // Elegir tipo de ramo
    const [choice, setChoice] = useState(null); // "rose" | "lino"
    const selected = RAMOS.find((r) => r.key === choice) || null;

    // Galería: usa product.gallery si viene; si no, cae a [product.img]
    const gallery = useMemo(() => {
        if (Array.isArray(product.gallery) && product.gallery.length) return product.gallery;
        return [product.img];
    }, [product]);

    // IMG del hero: si ya eligió ramo, mostramos ese; si no, la primera de la galería
    const heroSrc = selected?.img || gallery[0];

    return (
        <main>
            {/* HERO compacto (no tapa la galería) */}
            <Hero src={heroSrc} title={product.name} subtitle={product.subtitle} />


            {/* Miniaturas + Lightbox (desktop y móvil) */}
            <ThumbsWithLightbox images={gallery} />

            {/* Separador */}
            <div className="container">
                <div className="my-6 h-[2px] bg-brand-pink/80" />
            </div>

            {/* CUERPO: IZQ (ramos) / DER (form) */}
            <section className="container grid gap-6 md:gap-10 md:grid-cols-2">
                {/* IZQUIERDA: Elige tu ramo */}
                <RamoPicker ramos={RAMOS} choice={choice} onChange={setChoice} />

                {/* DERECHA: Formulario (sticky) */}
                <aside className="md:sticky md:top-24 self-start rounded-2xl border bg-white p-4 sm:p-6">
                    <h3 className="text-2xl md:text-3xl font-semibold">Personaliza</h3>
                    <OrderForm
                        disabled={!selected}
                        helper={!selected ? "Primero elige un tipo de ramo." : ""}
                        total={selected?.price ?? 0}
                    />
                </aside>
            </section>

            {/* Barra fija inferior en móvil */}
            <BottomBarMobile total={selected?.price ?? 0} disabled={!selected} />
        </main>
    );
}

/* ----------------- Subcomponentes locales (simple/plug & play) ----------------- */

function RamoPicker({ ramos, choice, onChange }) {
    return (
        <div className="rounded-2xl border bg-white p-4 sm:p-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl md:text-3xl font-semibold">Elige tu ramo</h2>
                <Link href="/#productos" className="text-sm underline">
                    ← Volver a productos
                </Link>
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
                            <div className="h-[2px] bg-brand-pink" />
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

function OrderForm({ disabled, helper, total }) {
    return (
        <form className={`mt-3 space-y-4 ${disabled ? "opacity-60 pointer-events-none" : ""}`}>
            {helper && <div className="text-sm text-gray-600">{helper}</div>}

            <div>
                <label className="block text-sm font-medium mb-1">Ciudad</label>
                <select className="w-full rounded-md border px-3 py-2 bg-white">
                    <option>CDMX</option>
                    <option>Guadalajara</option>
                    <option>Monterrey</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Fecha de entrega</label>
                <input type="date" className="w-full rounded-md border px-3 py-2" />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Título / Subtítulo</label>
                <input type="text" placeholder="Escribe tu texto" className="w-full rounded-md border px-3 py-2" />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Firma / Mensaje</label>
                <textarea rows={3} className="w-full rounded-md border px-3 py-2" />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Sube tus imágenes (máx. 4)</label>
                <input type="file" accept="image/*" multiple className="block w-full text-sm" />
            </div>

            <div className="pt-2 flex items-center justify-between">
                <span className="text-sm text-gray-600">Total</span>
                <span className="text-xl font-semibold">
          ${total} <span className="text-xs">MXN</span>
        </span>
            </div>

            {/* En desktop sí mostramos botón dentro del panel; en móvil lo cubre la bottom bar */}
            <button
                type="button"
                className="mt-2 inline-flex items-center justify-center rounded-full border px-6 py-2 font-medium hover:bg-gray-50 hidden md:inline-flex"
                disabled={disabled}
            >
                Agregar al carrito
            </button>
        </form>
    );
}

function BottomBarMobile({ total, disabled }) {
    return (
        <div className="md:hidden sticky bottom-0 left-0 right-0 z-20 border-t bg-white/95 backdrop-blur">
            <div className="container py-3 flex items-center justify-between">
                <div className="text-base">
                    <span className="text-gray-600 text-sm">Total</span>{" "}
                    <span className="font-semibold">${total}</span>{" "}
                    <span className="text-[10px] align-super">MXN</span>
                </div>
                <button
                    className="rounded-full border px-5 py-2 text-sm font-medium disabled:opacity-60"
                    disabled={disabled}
                >
                    Agregar al carrito
                </button>
            </div>
        </div>
    );
}
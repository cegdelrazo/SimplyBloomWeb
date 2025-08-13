// components/bouquet/ProductGallery.jsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export default function ProductGallery({ images = [] }) {
    const pics = useMemo(() => (images.length ? images : []), [images]);
    const [current, setCurrent] = useState(0);
    const [open, setOpen] = useState(false);

    const prev = useCallback(
        () => setCurrent((i) => (i - 1 + pics.length) % pics.length),
        [pics.length]
    );
    const next = useCallback(
        () => setCurrent((i) => (i + 1) % pics.length),
        [pics.length]
    );

    // Teclado en lightbox
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === "Escape") setOpen(false);
            if (e.key === "ArrowLeft") prev();
            if (e.key === "ArrowRight") next();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, prev, next]);

    if (!pics.length) return null;

    return (
        <div className="grid grid-cols-[110px_1fr] gap-4">
            {/* THUMBS (scrollable) */}
            <div className="max-h-[560px] overflow-auto pr-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <ul className="flex md:flex-col gap-3">
                    {pics.map((src, i) => (
                        <li key={i}>
                            <button
                                type="button"
                                onClick={() => setCurrent(i)}
                                aria-label={`Foto ${i + 1}`}
                                className={`block overflow-hidden rounded-xl border ${current === i ? "border-black" : "border-gray-200 hover:border-gray-300"}`}
                                style={{ width: 100, height: 100 }}
                            >
                                <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* FOTO PRINCIPAL */}
            <div className="overflow-hidden rounded-2xl border">
                <div className="aspect-[4/5] w-full bg-white relative">
                    <img
                        src={pics[current]}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="eager"
                        onClick={() => setOpen(true)}
                        role="button"
                    />
                </div>
                <div className="flex items-center justify-between px-3 py-2 border-t bg-white">
                    <div className="text-sm text-gray-600">{current + 1} / {pics.length}</div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={prev}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border hover:bg-gray-50"
                            aria-label="Anterior"
                        >
                            ←
                        </button>
                        <button
                            type="button"
                            onClick={next}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border hover:bg-gray-50"
                            aria-label="Siguiente"
                        >
                            →
                        </button>
                        <button
                            type="button"
                            onClick={() => setOpen(true)}
                            className="inline-flex h-8 items-center justify-center rounded-full border px-3 hover:bg-gray-50"
                            aria-label="Ampliar"
                        >
                            Ver grande
                        </button>
                    </div>
                </div>
            </div>

            {/* LIGHTBOX */}
            {open && (
                <div
                    className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setOpen(false)}
                >
                    <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={pics[current]}
                            alt=""
                            className="w-full h-auto rounded-xl"
                        />
                        <button
                            className="absolute -top-3 -right-3 h-9 w-9 rounded-full bg-white text-black border shadow"
                            onClick={() => setOpen(false)}
                            aria-label="Cerrar"
                        >
                            ✕
                        </button>

                        <div className="absolute inset-y-0 left-0 flex items-center">
                            <button
                                onClick={prev}
                                className="m-2 h-10 w-10 rounded-full bg-white/90 text-black border shadow hover:bg-white"
                                aria-label="Anterior"
                            >
                                ←
                            </button>
                        </div>
                        <div className="absolute inset-y-0 right-0 flex items-center">
                            <button
                                onClick={next}
                                className="m-2 h-10 w-10 rounded-full bg-white/90 text-black border shadow hover:bg-white"
                                aria-label="Siguiente"
                            >
                                →
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
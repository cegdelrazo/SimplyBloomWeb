"use client";

import { useMemo, useState } from "react";
import Lightbox from "@/components/gallery/Lightbox";

export default function ThumbsWithLightbox({ images = [], className = "" }) {
    const pics = useMemo(() => (Array.isArray(images) && images.length ? images : []), [images]);
    const [open, setOpen] = useState(false);
    const [idx, setIdx] = useState(0);

    if (!pics.length) return null;

    const prev = () => setIdx((i) => (i - 1 + pics.length) % pics.length);
    const next = () => setIdx((i) => (i + 1) % pics.length);

    return (
        <>
            {/* Fila horizontal scrollable, misma para móvil y desktop */}
            <div
                className={
                    "container mt-6 " +
                    "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden " +
                    (className || "")
                }
            >
                <div className="flex gap-3 overflow-x-auto pb-1">
                    {pics.map((src, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => {
                                setIdx(i);
                                setOpen(true);
                            }}
                            className="shrink-0 overflow-hidden rounded-xl border hover:opacity-90 transition"
                            style={{ width: 140, height: 140 }}
                            aria-label={`Abrir imagen ${i + 1}`}
                        >
                            <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Lightbox */}
            <Lightbox
                open={open}
                images={pics}
                index={idx}
                onClose={() => setOpen(false)}
                onPrev={prev}
                onNext={next}
            />
        </>
    );
}
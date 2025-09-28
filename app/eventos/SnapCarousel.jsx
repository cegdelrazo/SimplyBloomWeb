"use client";

import Image from "next/image";
import { useRef } from "react";

/**
 * Carrusel vertical con imágenes fijas 360x480 (3:4).
 * Todas se ven iguales, sin bordes ni relleno, usando object-cover.
 */
export default function SnapCarousel({ images = [] }) {
    const trackRef = useRef(null);

    const scrollByDir = (dir) => {
        const el = trackRef.current;
        if (!el) return;
        el.scrollBy({
            left: el.clientWidth * 0.9 * (dir === "next" ? 1 : -1),
            behavior: "smooth",
        });
    };

    if (!images.length) return null;

    return (
        <div className="relative">
            {/* Botones */}
            <button
                type="button"
                onClick={() => scrollByDir("prev")}
                className="absolute left-1 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 border shadow p-2 hover:bg-white"
                aria-label="Anterior"
            >
                ‹
            </button>
            <button
                type="button"
                onClick={() => scrollByDir("next")}
                className="absolute right-1 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 border shadow p-2 hover:bg-white"
                aria-label="Siguiente"
            >
                ›
            </button>

            {/* Pista */}
            <div
                ref={trackRef}
                className="overflow-x-auto snap-x snap-mandatory flex gap-4 scroll-smooth py-2
                   [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
                {images.map((src, idx) => (
                    <div
                        key={idx}
                        className="snap-start shrink-0 rounded-lg overflow-hidden border bg-white
                                   w-[360px] h-[480px]"
                    >
                        <div className="relative w-full h-full">
                            <Image
                                src={src}
                                alt={`Galería ${idx + 1}`}
                                fill
                                className="object-cover"
                                sizes="360px"
                                loading={idx < 2 ? "eager" : "lazy"}
                                priority={false}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
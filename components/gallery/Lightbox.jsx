"use client";

import { useEffect, useRef } from "react";

export default function Lightbox({ open, images = [], index = 0, onClose, onPrev, onNext }) {
    const overlayRef = useRef(null);
    const startX = useRef(0);
    const swiping = useRef(false);

    // Cerrar/Esc + navegación con teclado
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === "Escape") onClose?.();
            if (e.key === "ArrowLeft") onPrev?.();
            if (e.key === "ArrowRight") onNext?.();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onClose, onPrev, onNext]);

    if (!open) return null;

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => {
                if (e.target === overlayRef.current) onClose?.();
            }}
            onTouchStart={(e) => {
                if (!e.touches?.length) return;
                startX.current = e.touches[0].clientX;
                swiping.current = true;
            }}
            onTouchMove={(e) => {
                if (!swiping.current || !e.touches?.length) return;
                const dx = e.touches[0].clientX - startX.current;
                // no hacemos translate visual para mantenerlo simple
                if (Math.abs(dx) > 60) {
                    swiping.current = false;
                    if (dx > 0) onPrev?.();
                    else onNext?.();
                }
            }}
            onTouchEnd={() => {
                swiping.current = false;
            }}
        >
            <div className="relative max-w-5xl w-full">
                {/* Imagen */}
                <img
                    src={images[index]}
                    alt=""
                    className="w-full h-auto rounded-xl select-none"
                    draggable={false}
                />

                {/* Cerrar */}
                <button
                    onClick={onClose}
                    className="absolute -top-3 -right-3 h-9 w-9 rounded-full bg-white text-black border shadow"
                    aria-label="Cerrar"
                >
                    ✕
                </button>

                {/* Prev / Next */}
                <button
                    onClick={onPrev}
                    className="absolute inset-y-0 left-0 m-2 h-10 w-10 rounded-full bg-white/90 text-black border shadow hover:bg-white"
                    aria-label="Anterior"
                >
                    ←
                </button>
                <button
                    onClick={onNext}
                    className="absolute inset-y-0 right-0 m-2 h-10 w-10 rounded-full bg-white/90 text-black border shadow hover:bg-white"
                    aria-label="Siguiente"
                >
                    →
                </button>

                {/* Indicador */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/90 text-sm">
                    {index + 1} / {images.length}
                </div>
            </div>
        </div>
    );
}
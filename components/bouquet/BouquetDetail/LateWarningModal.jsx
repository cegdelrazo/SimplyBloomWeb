"use client";

import { useEffect } from "react";

export default function LateWarningModal({
                                             open,
                                             cityName,
                                             onClose,
                                             onAccept, // opcional
                                         }) {
    useEffect(() => {
        if (!open) return;
        const onEsc = (e) => e.key === "Escape" && onClose?.();
        window.addEventListener("keydown", onEsc);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onEsc);
            document.body.style.overflow = prev;
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[99990]"
            role="dialog"
            aria-modal="true"
            aria-label="Aviso importante"
        >
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="absolute inset-0 z-[99999] flex items-center justify-center p-0 sm:p-4">
                <div
                    className="
            w-full sm:max-w-[420px]
            h-screen sm:h-auto sm:max-h-[90vh]
            bg-white rounded-none sm:rounded-2xl shadow-xl border
            flex flex-col
          "
                >
                    {/* Header con botón cerrar */}
                    <div className="relative">
                        {/* Botón cerrar */}
                        <button
                            onClick={onClose}
                            aria-label="Cerrar"
                            className="
                absolute top-3 right-3 z-10
                inline-flex items-center justify-center
                h-9 w-9 rounded-full border bg-white/90 backdrop-blur
                hover:bg-gray-50 active:scale-[0.98] transition
              "
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-gray-700"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Imagen controlada: en mobile altura limitada */}
                        <div className="w-full bg-white flex items-center justify-center">
                            <img
                                src="/media/bouquets/hero-warning.webp"
                                alt="Aviso importante"
                                className="
                  w-full h-auto object-contain
                  max-h-[32vh] sm:max-h-none
                "
                                loading="eager"
                                fetchPriority="high"
                                draggable={false}
                            />
                        </div>
                    </div>

                    {/* Contenido scrollable */}
                    <div className="flex-1 overflow-y-auto px-5 pb-4 pt-3">
                        <h3 className="font-serif text-lg sm:text-xl italic">Aviso importante</h3>
                        <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                            Por cuestiones de horario, no podemos garantizar tu entrega para{" "}
                            <strong>
                                mañana{cityName ? ` en ${cityName}` : ""}
                            </strong>
                            . Podemos programarla para el día siguiente; si necesitas más
                            información, contáctanos.
                        </p>
                    </div>

                    {/* Barra de acciones sticky (siempre visible) */}
                    <div
                        className="
              sticky bottom-0 w-full
              bg-white/95 backdrop-blur border-t
              px-5 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))]
              flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 items-stretch sm:items-center justify-end
            "
                    >
                        <button
                            onClick={onClose}
                            className="inline-flex justify-center items-center rounded-full border px-4 py-2 text-sm font-medium hover:bg-gray-50"
                        >
                            Elegir otra fecha
                        </button>

                        <a
                            href="https://wa.me/523322029594"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex justify-center items-center rounded-full border px-4 py-2 text-sm font-medium hover:bg-gray-50"
                        >
                            Contactarnos
                        </a>

                        {typeof onAccept === "function" && (
                            <button
                                onClick={onAccept}
                                className="inline-flex justify-center items-center rounded-full bg-brand-pink text-white px-4 py-2 text-sm font-medium shadow hover:opacity-90"
                            >
                                Continuar
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
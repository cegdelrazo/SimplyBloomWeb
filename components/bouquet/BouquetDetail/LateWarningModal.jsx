"use client";

import { useEffect, useMemo } from "react";

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

    // =====================
    // WhatsApp por ciudad
    // =====================
    const whatsappUrl = useMemo(() => {
        if (!cityName) return "https://wa.me/523322029594"; // fallback
        const map = {
            CDMX: "https://wa.me/5518358013",
            Guadalajara: "https://wa.me/523322029594",
            Monterrey: "https://wa.me/528135666682",
        };
        return map[cityName] || "https://wa.me/523322029594"; // default Guadalajara
    }, [cityName]);

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

            {/* Contenedor */}
            <div className="absolute inset-0 z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4">
                <div
                    className={`
            w-full sm:max-w-[420px]
            bg-white shadow-xl border
            rounded-t-2xl sm:rounded-2xl
            max-h-[85vh] sm:max-h-[90vh]
            overflow-hidden flex flex-col
          `}
                >
                    {/* Handle superior (solo mobile) */}
                    <div className="sm:hidden pt-3">
                        <div className="mx-auto h-1.5 w-12 rounded-full bg-gray-300" />
                    </div>

                    {/* Imagen */}
                    <div className="w-full px-5 sm:px-0 mt-2 sm:mt-3">
                        <img
                            src="/media/bouquets/hero-warning.webp"
                            alt="Aviso importante"
                            className="w-full h-auto max-h-[200px] sm:max-h-[280px] object-contain rounded-xl"
                            loading="eager"
                            fetchPriority="high"
                            draggable={false}
                        />
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 overflow-y-auto px-5 pb-3 pt-3 sm:pt-4">
                        <h3 className="font-serif text-base sm:text-lg italic">
                            Aviso importante
                        </h3>
                        <p className="mt-2 text-[15px] sm:text-sm text-gray-700 leading-relaxed">
                            Por cuestiones de horario, no podemos garantizar tu entrega para{" "}
                            <strong>mañana{cityName ? ` en ${cityName}` : ""}</strong>. Podemos
                            programarla para el día siguiente; si necesitas más información,
                            contáctanos.
                        </p>
                    </div>

                    {/* Barra de acciones */}
                    <div
                        className="
              sticky bottom-0 w-full
              bg-white/95 backdrop-blur border-t
              px-5 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))]
              flex flex-col sm:flex-row gap-2 sm:gap-3
            "
                    >
                        <button
                            onClick={onClose}
                            className="
                w-full sm:w-auto
                inline-flex justify-center items-center
                rounded-full border px-4 py-2 text-sm font-medium
                hover:bg-gray-50
              "
                        >
                            Elegir otra fecha
                        </button>

                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="
                w-full sm:w-auto
                inline-flex justify-center items-center
                rounded-full border px-4 py-2 text-sm font-medium
                hover:bg-gray-50
              "
                        >
                            Contactarnos
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
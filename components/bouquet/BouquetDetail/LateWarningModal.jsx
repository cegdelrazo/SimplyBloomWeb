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
            className="fixed inset-0 z-[99990]"  // contenedor raíz
            role="dialog"
            aria-modal="true"
            aria-label="Aviso importante"
        >
            {/* Overlay: ÚNICO que cierra. Está DETRÁS del panel. */}
            <div
                className="absolute inset-0 z-[99990] bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel: z-index MAYOR al overlay; sin onClick */}
            <div className="absolute inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4">
                <div
                    className="w-full max-w-[380px] overflow-hidden rounded-2xl border bg-white shadow-xl"
                    // SIN onClick aquí
                >
                    {/* Imagen completa, NO cierra al hacer click */}
                    <div className="w-full bg-white flex items-center justify-center">
                        <img
                            src="/media/bouquets/hero-warning.webp"   // tu imagen
                            alt="Aviso importante"
                            className="w-full h-auto object-contain"
                            loading="eager"
                            fetchPriority="high"
                            draggable={false}
                        />
                    </div>

                    {/* Contenido alineado a la derecha */}
                    <div className="p-5 text-right">
                        <h3 className="font-serif text-lg sm:text-xl italic">Aviso importante</h3>
                        <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                            Por cuestiones de horario, no podemos garantizar tu entrega para{" "}
                            <strong>mañana{cityName ? ` en ${cityName}` : ""}</strong>. Podemos
                            programarla para el día siguiente; si necesitas más información, contáctanos.
                        </p>

                        <div className="mt-4 flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 items-end justify-end">
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

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
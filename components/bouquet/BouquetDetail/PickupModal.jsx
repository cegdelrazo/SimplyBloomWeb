"use client";

import { useEffect } from "react";

export default function PickupModal({
                                        open,
                                        onClose,
                                        onAccept, // cambiar a pickup
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

            {/* Contenedor */}
            <div className="absolute inset-0 z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4">
                <div
                    className="
            w-full sm:max-w-[420px]
            bg-white shadow-xl border
            rounded-t-2xl sm:rounded-2xl
            max-h-[85vh] sm:max-h-[90vh]
            overflow-hidden flex flex-col
          "
                >
                    {/* Handle mobile */}
                    <div className="sm:hidden pt-3">
                        <div className="mx-auto h-1.5 w-12 rounded-full bg-gray-300" />
                    </div>

                    {/* Imagen */}
                    <div className="w-full px-5 sm:px-0 mt-2 sm:mt-3">
                        <img
                            src="/media/bouquets/pickup.png"
                            alt="Aviso importante"
                            className="w-full h-auto max-h-[200px] sm:max-h-[280px] object-contain rounded-xl"
                            draggable={false}
                        />
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 overflow-y-auto px-5 pb-3 pt-3 sm:pt-4">
                        <h3 className="font-serif text-xl sm:text-2xl italic text-center">
                            Aviso Importante.
                        </h3>

                        <p className="mt-4 text-[15px] sm:text-base text-gray-700 leading-relaxed text-center">
                            Debido a la alta demanda de envíos en esta fecha, no podemos
                            garantizar una hora exacta de entrega, ya que puede variar según
                            rutas y tráfico. Si necesitas tu pedido a una hora específica, te
                            recomendamos elegir la opción{" "}
                            <strong>“Pickup”.</strong>
                        </p>
                    </div>

                    {/* Acciones */}
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
                w-full
                inline-flex justify-center items-center
                rounded-full border px-4 py-2 text-sm font-medium
                hover:bg-gray-50
              "
                        >
                            Envío está bien
                        </button>

                        <button
                            onClick={onAccept}
                            className="
                w-full
                inline-flex justify-center items-center
                rounded-full border px-4 py-2 text-sm font-medium
                hover:bg-gray-50
              "
                        >
                            Quiero cambiar a pickup
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

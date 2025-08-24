"use client";

import { useEffect, useState } from "react";

export default function Toast({ open, onClose, message = "Ramo agregado al carrito", duration = 2500 }) {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        if (!open) return;

        setProgress(100); // reset al abrir
        const interval = 50; // ms
        const steps = duration / interval;
        let current = 100;

        const id = setInterval(() => {
            current -= 100 / steps;
            if (current <= 0) {
                clearInterval(id);
                setProgress(0);
                onClose?.();
            } else {
                setProgress(current);
            }
        }, interval);

        return () => clearInterval(id);
    }, [open, duration, onClose]);

    return (
        <div
            className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 w-[90%] max-w-md transition-all duration-300 ${
                open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
            }`}
        >
            <div className="overflow-hidden rounded-xl border border-green-200 bg-white shadow-lg">
                {/* Texto */}
                <div className="px-4 py-3 text-center text-sm font-medium text-gray-800">
                    {message}
                </div>
                {/* Barra inferior */}
                <div className="h-1 w-full bg-green-100">
                    <div
                        className="h-full bg-green-500 transition-all duration-100 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
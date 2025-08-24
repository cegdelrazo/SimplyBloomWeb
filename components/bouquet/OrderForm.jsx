// components/bouquet/OrderForm.jsx
"use client";

import { useState } from "react";

const cities = [
    { city: "CDMX", pickup: "Polanco" },
    { city: "Guadalajara", pickup: "Colonia Lomas del Valle" },
    { city: "Monterrey", pickup: "Dr. Roberto J. Cantú." },
    { city: "Monterrey", pickup: "Dr. Roberto J. Cantú." },
];

export default function OrderForm({ disabled, helper, total }) {
    const [selectedCity, setSelectedCity] = useState(null);

    const handleChangeCity = (e) => {
        const value = e.target.value;
        const cityObj = cities.find((c) => c.city === value);
        setSelectedCity(cityObj);
    };

    return (
        <form
            className={`mt-3 space-y-4 ${
                disabled ? "opacity-60 pointer-events-none" : ""
            }`}
        >
            {helper && <div className="text-sm text-gray-600">{helper}</div>}

            {/* Ciudad */}
            <div>
                <label className="block text-sm font-medium mb-1">Ciudad</label>
                <select
                    className="w-full rounded-md border px-3 py-2 bg-white"
                    onChange={handleChangeCity}
                    value={selectedCity?.city || ""}
                >
                    <option value="" disabled>
                        Selecciona ciudad
                    </option>
                    {cities.map((c) => (
                        <option key={c.city} value={c.city}>
                            {c.city}
                        </option>
                    ))}
                </select>
                {selectedCity && (
                    <p className="mt-1 text-xs text-gray-600">
                        Punto de entrega: <strong>{selectedCity.pickup}</strong>
                    </p>
                )}
            </div>

            {/* Fecha */}
            <div>
                <label className="block text-sm font-medium mb-1">Fecha de entrega</label>
                <input
                    type="date"
                    className="w-full rounded-md border px-3 py-2"
                    disabled={disabled}
                />
            </div>

            {/* Título */}
            <div>
                <label className="block text-sm font-medium mb-1">Título / Subtítulo</label>
                <input
                    type="text"
                    placeholder="Escribe tu texto"
                    className="w-full rounded-md border px-3 py-2"
                    disabled={disabled}
                />
            </div>

            {/* Mensaje */}
            <div>
                <label className="block text-sm font-medium mb-1">Firma / Mensaje</label>
                <textarea
                    rows={3}
                    className="w-full rounded-md border px-3 py-2"
                    disabled={disabled}
                />
            </div>

            {/* Imágenes */}
            <div>
                <label className="block text-sm font-medium mb-1">
                    Sube tus imágenes (máx. 4)
                </label>
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="block w-full text-sm"
                    disabled={disabled}
                />
            </div>

            {/* Total */}
            <div className="pt-2 flex items-center justify-between">
                <span className="text-sm text-gray-600">Total</span>
                <span className="text-xl font-semibold">
          ${total} <span className="text-xs">MXN</span>
        </span>
            </div>

            {/* Solo desktop */}
            <button
                type="button"
                className="mt-2 hidden md:inline-flex items-center justify-center rounded-full border px-6 py-2 font-medium hover:bg-gray-50"
                disabled={disabled}
            >
                Agregar al carrito
            </button>
        </form>
    );
}
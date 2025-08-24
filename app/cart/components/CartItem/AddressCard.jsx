"use client";

import { useState } from "react";

export default function AddressCard({ id, deliveryAddress, onSaveAddress }) {
    const [openAddr, setOpenAddr] = useState(false);
    const [addr, setAddr] = useState(() => ({
        fullName: deliveryAddress?.fullName || "",
        street: deliveryAddress?.street || "",
        extNumber: deliveryAddress?.extNumber || "",
        neighborhood: deliveryAddress?.neighborhood || "",
        postalCode: deliveryAddress?.postalCode || "",
        phone: deliveryAddress?.phone || "",
        references: deliveryAddress?.references || "",
    }));

    const handleSubmit = (e) => {
        e.preventDefault();
        onSaveAddress?.(id, addr);
        setOpenAddr(false);
    };

    return (
        <div className="rounded-xl border bg-gray-50 p-3">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-800">Dirección de entrega</h4>
                <button
                    onClick={() => setOpenAddr((v) => !v)}
                    className="rounded-full border px-3 py-1.5 text-xs hover:bg-white"
                >
                    {deliveryAddress ? "Editar" : "Agregar"}
                </button>
            </div>

            {!openAddr && deliveryAddress ? (
                <div className="mt-2 text-sm text-gray-700">
                    <div className="font-medium">{deliveryAddress.fullName}</div>
                    <div>
                        {deliveryAddress.street} {deliveryAddress.extNumber}, {deliveryAddress.neighborhood}
                    </div>
                    <div>
                        CP {deliveryAddress.postalCode}
                        {deliveryAddress.phone ? ` • Tel: ${deliveryAddress.phone}` : ""}
                    </div>
                    {deliveryAddress.references ? (
                        <div className="text-gray-600 mt-1">{deliveryAddress.references}</div>
                    ) : null}
                </div>
            ) : null}

            {openAddr && (
                <form onSubmit={handleSubmit} className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input
                        className="rounded-md border px-3 py-2"
                        placeholder="Nombre completo"
                        value={addr.fullName}
                        onChange={(e) => setAddr({ ...addr, fullName: e.target.value })}
                        required
                    />
                    <input
                        className="rounded-md border px-3 py-2"
                        placeholder="Calle"
                        value={addr.street}
                        onChange={(e) => setAddr({ ...addr, street: e.target.value })}
                        required
                    />
                    <input
                        className="rounded-md border px-3 py-2"
                        placeholder="Número"
                        value={addr.extNumber}
                        onChange={(e) => setAddr({ ...addr, extNumber: e.target.value })}
                        required
                    />
                    <input
                        className="rounded-md border px-3 py-2"
                        placeholder="Colonia"
                        value={addr.neighborhood}
                        onChange={(e) => setAddr({ ...addr, neighborhood: e.target.value })}
                        required
                    />
                    <input
                        className="rounded-md border px-3 py-2"
                        placeholder="CP (5 dígitos)"
                        value={addr.postalCode}
                        onChange={(e) =>
                            setAddr({
                                ...addr,
                                postalCode: e.target.value.replace(/\D/g, "").slice(0, 5),
                            })
                        }
                        required
                    />
                    <input
                        className="rounded-md border px-3 py-2"
                        placeholder="Teléfono (opcional)"
                        value={addr.phone}
                        onChange={(e) => setAddr({ ...addr, phone: e.target.value })}
                    />
                    <textarea
                        className="md:col-span-2 rounded-md border px-3 py-2"
                        placeholder="Referencias (opcional)"
                        rows={2}
                        value={addr.references}
                        onChange={(e) => setAddr({ ...addr, references: e.target.value })}
                    />
                    <div className="md:col-span-2 flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setOpenAddr(false)}
                            className="rounded-full border px-4 py-2 text-xs hover:bg-white"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="rounded-full bg-brand-pink px-5 py-2 text-xs font-semibold text-white hover:brightness-110"
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
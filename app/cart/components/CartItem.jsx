"use client";

import { useState } from "react";
import Image from "next/image";

export default function CartItem({ item, onSaveAddress, onRemove }) {
    const { id, name, price, quantity = 1, options, image, deliveryAddress, shipping } = item;

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

    const subtotal = price * quantity;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSaveAddress?.(id, addr);   // ← guarda dirección; el cálculo de envío lo hace la page
        setOpenAddr(false);
    };

    return (
        <article className="flex flex-col gap-4 p-4 md:p-5 rounded-2xl border bg-white shadow-sm hover:shadow-md transition">
            {/* Top: imagen + título + precio + eliminar */}
            <div className="flex gap-4">
                <div className="relative h-28 w-28 shrink-0">
                    <Image src={image} alt={name} fill className="object-cover rounded-lg" />
                </div>

                <div className="flex-1">
                    <header className="flex items-start justify-between gap-3">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
                            <p className="mt-0.5 text-gray-900 text-xl font-bold">
                                ${price.toLocaleString("es-MX")}
                            </p>
                        </div>
                        <button
                            onClick={() => onRemove?.(id)}
                            className="text-sm font-medium text-red-600 hover:text-red-700"
                        >
                            Eliminar
                        </button>
                    </header>

                    {/* Opciones del ramo */}
                    <ul className="mt-2 text-sm text-gray-600 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                        <li><span className="font-medium">Ciudad:</span> {options.city}</li>
                        <li><span className="font-medium">Entrega:</span> {options.date}</li>
                        {options.title ? <li className="md:col-span-2"><span className="font-medium">Título:</span> {options.title}</li> : null}
                        {options.message ? <li className="md:col-span-2"><span className="font-medium">Mensaje:</span> {options.message}</li> : null}
                        {options.imagesCount > 0 ? <li><span className="font-medium">Fotos:</span> {options.imagesCount}</li> : null}
                    </ul>
                </div>
            </div>

            {/* Dirección de entrega */}
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
                        <div>{deliveryAddress.street} {deliveryAddress.extNumber}, {deliveryAddress.neighborhood}</div>
                        <div>CP {deliveryAddress.postalCode}{deliveryAddress.phone ? ` • Tel: ${deliveryAddress.phone}` : ""}</div>
                        {deliveryAddress.references ? <div className="text-gray-600 mt-1">{deliveryAddress.references}</div> : null}
                    </div>
                ) : null}

                {openAddr && (
                    <form onSubmit={handleSubmit} className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                        <input className="rounded-md border px-3 py-2" placeholder="Nombre completo" value={addr.fullName} onChange={(e) => setAddr({ ...addr, fullName: e.target.value })} required />
                        <input className="rounded-md border px-3 py-2" placeholder="Calle" value={addr.street} onChange={(e) => setAddr({ ...addr, street: e.target.value })} required />
                        <input className="rounded-md border px-3 py-2" placeholder="Número" value={addr.extNumber} onChange={(e) => setAddr({ ...addr, extNumber: e.target.value })} required />
                        <input className="rounded-md border px-3 py-2" placeholder="Colonia" value={addr.neighborhood} onChange={(e) => setAddr({ ...addr, neighborhood: e.target.value })} required />
                        <input className="rounded-md border px-3 py-2" placeholder="CP (5 dígitos)" value={addr.postalCode} onChange={(e) => setAddr({ ...addr, postalCode: e.target.value.replace(/\D/g, "").slice(0, 5) })} required />
                        <input className="rounded-md border px-3 py-2" placeholder="Teléfono (opcional)" value={addr.phone} onChange={(e) => setAddr({ ...addr, phone: e.target.value })} />
                        <textarea className="md:col-span-2 rounded-md border px-3 py-2" placeholder="Referencias (opcional)" rows={2} value={addr.references} onChange={(e) => setAddr({ ...addr, references: e.target.value })} />
                        <div className="md:col-span-2 flex items-center justify-end gap-2">
                            <button type="button" onClick={() => setOpenAddr(false)} className="rounded-full border px-4 py-2 text-xs hover:bg-white">Cancelar</button>
                            <button type="submit" className="rounded-full bg-brand-pink px-5 py-2 text-xs font-semibold text-white hover:brightness-110">Guardar</button>
                        </div>
                    </form>
                )}
            </div>

            {/* Envío por ítem (NO pide CP aquí; se calcula desde la page con el CP de la dirección) */}
            <div className="rounded-xl border bg-white p-3">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-800">Envío de este producto</h4>
                    {shipping?.valid ? (
                        <span className="text-xs text-gray-600">
              {shipping.zone} • {shipping.etaDays}
            </span>
                    ) : null}
                </div>

                {shipping?.valid ? (
                    <>
                        <p className="mt-2 text-xs text-gray-600">{shipping.note}</p>
                        <div className="mt-2 flex items-center justify-between">
                            <span className="text-sm text-gray-600">Costo de envío</span>
                            <span className="text-base font-semibold text-gray-900">
                ${shipping.cost.toLocaleString("es-MX")}
              </span>
                        </div>
                    </>
                ) : (
                    <p className="mt-2 text-xs text-red-500">
                        Agrega un CP en la dirección para calcular envío.
                    </p>
                )}
            </div>

            {/* Subtotal del ítem */}
            <div className="text-sm text-gray-500">
                Subtotal: <strong className="text-gray-800">${subtotal.toLocaleString("es-MX")}</strong>
            </div>
        </article>
    );
}
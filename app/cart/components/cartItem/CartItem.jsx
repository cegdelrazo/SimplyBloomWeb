"use client";

import { useState, useMemo, useCallback } from "react";
import { useGlobalContext } from "@/app/context/globalContext";
import ItemHeaderRow from "./ItemHeaderRow";
import MessageNote from "./MessageNote";
import DeliveryModeSelector from "./DeliveryModeSelector";
import AddressForm from "@/app/cart/components/cartItem/address";
import { simulateShippingByCP } from "@/utils/shipping";
import ImagesStrip from "@/app/cart/components/cartItem/ImagesStrip";

export default function CartItem({ item }) {
    const { dispatch } = useGlobalContext();
    const { product, price, options } = item || {};

    const initialMode =
        item?.deliveryAddress?.mode === "delivery" ? "delivery" : "pickup";
    const [deliveryMode, setDeliveryMode] = useState(initialMode);

    const pickupAddress = useMemo(
        () => options?.city?.pickup || "Punto de recolección por confirmar",
        [options?.city?.pickup]
    );

    const syncAddress = (patch) => {
        const next = { ...(item.deliveryAddress || { mode: deliveryMode }), ...patch };
        dispatch({
            type: "SET_ITEM_ADDRESS",
            payload: { lineId: item.lineId, address: next },
        });
    };

    const handleModeChange = (mode) => {
        setDeliveryMode(mode);
        syncAddress({ mode });
    };

    const handleCpChange = (cp) => {
        const sim = simulateShippingByCP(cp);
        dispatch({
            type: "SET_ITEM_SHIPPING",
            payload: {
                lineId: item.lineId,
                shipping: {
                    cp,
                    valid: !!sim.valid,
                    zone: sim.zone ?? null,
                    cost: sim.valid ? sim.cost : 0,
                    etaDays: sim.etaDays ?? null,
                    note: sim.valid ? (sim.note ?? "") : (sim.message ?? "Ingresa un CP válido de 5 dígitos."),
                },
            },
        });
    };

    const removeItem = useCallback(() => {
        dispatch({ type: "REMOVE_ITEM_CART", payload: item.lineId });
    }, [dispatch, item.lineId]);

    const confirmAndRemove = useCallback(() => {
        if (window.confirm("¿Eliminar este artículo del carrito?")) removeItem();
    }, [removeItem]);

    return (
        <article className="border-b border-gray-100 py-6 space-y-4">
            {/* Encabezado */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <ItemHeaderRow
                        image={item?.image}
                        productName={product?.name}
                        productSubtitle={product?.subtitle}
                        city={options?.city?.city}
                        date={options?.date}
                        price={price}
                    />
                </div>

                {/* Botón eliminar: sólo desktop/tablet (evita chocar con el precio) */}
                <div className="hidden md:block shrink-0">
                    <button
                        type="button"
                        onClick={confirmAndRemove}
                        data-testid="remove-cart-item"
                        className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        aria-label={`Eliminar ${product?.name || item?.name || "artículo"}`}
                        title="Eliminar"
                    >
                        ✕ Eliminar
                    </button>
                </div>
            </div>

            {/* Botón eliminar en su propio bloque para mobile */}
            <div className="md:hidden">
                <button
                    type="button"
                    onClick={confirmAndRemove}
                    className="w-full rounded-md border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    aria-label={`Eliminar ${product?.name || item?.name || "artículo"}`}
                    title="Eliminar"
                >
                    ✕ Eliminar
                </button>
            </div>

            <MessageNote title={options?.title} message={options?.message} />
            <ImagesStrip lineId={item.lineId} images={item.images} />

            <div className="space-y-3">
                <DeliveryModeSelector
                    value={deliveryMode}
                    pickupAddress={pickupAddress}
                    onChange={handleModeChange}
                />

                {deliveryMode === "delivery" && (
                    <AddressForm
                        value={item?.deliveryAddress || {}}
                        onChange={(patch) => syncAddress(patch)}
                        onCpChange={handleCpChange}
                        shipping={item?.shipping}
                    />
                )}
            </div>
        </article>
    );
}
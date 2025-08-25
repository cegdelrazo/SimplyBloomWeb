"use client";

import { useState, useMemo } from "react";
import { useGlobalContext } from "@/app/context/globalContext";
import ItemHeaderRow from "./ItemHeaderRow";
import MessageNote from "./MessageNote";
import DeliveryModeSelector from "./DeliveryModeSelector";
import AddressForm from "@/app/cart/components/cartItem/address";
import { simulateShippingByCP } from "@/utils/shipping";

export default function CartItem({ item }) {
    const { dispatch } = useGlobalContext();
    const { product, price, options } = item || {};

    const initialMode = item?.deliveryAddress?.mode === "delivery" ? "delivery" : "pickup";
    const [deliveryMode, setDeliveryMode] = useState(initialMode);

    const pickupAddress = useMemo(
        () => options?.city?.pickup || "Punto de recolección por confirmar",
        [options?.city?.pickup]
    );

    const syncAddress = (patch) => {
        const next = { ...(item.deliveryAddress || { mode: deliveryMode }), ...patch };
        dispatch({ type: "SET_ITEM_ADDRESS", payload: { id: item.id, address: next } });
    };

    const handleModeChange = (mode) => {
        setDeliveryMode(mode);
        syncAddress({ mode });
    };

    // ⬇️ ahora simula y guarda envío cuando cambia C.P.
    const handleCpChange = (cp) => {
        const sim = simulateShippingByCP(cp);
        dispatch({
            type: "SET_ITEM_SHIPPING",
            payload: {
                id: item.id,
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

    return (
        <article className="border-b border-gray-100 py-6 space-y-4">
            <ItemHeaderRow
                image={item?.image}
                productName={product?.name}
                productSubtitle={product?.subtitle}
                city={options?.city?.city}
                date={options?.date}
                price={price}
            />

            <MessageNote title={options?.title} message={options?.message} />

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
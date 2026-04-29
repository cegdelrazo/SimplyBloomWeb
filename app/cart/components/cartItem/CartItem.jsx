"use client";

import { useState, useMemo, useCallback } from "react";
import { useGlobalContext } from "@/app/context/globalContext";
import MessageNote from "./MessageNote";
import DeliveryModeSelector from "./DeliveryModeSelector";
import AddressForm from "@/app/cart/components/cartItem/address";
import { simulateShippingByCP } from "@/utils/shipping";
import ImagesStrip from "@/app/cart/components/cartItem/ImagesStrip";
import PickupModal from "@/components/bouquet/BouquetDetail/PickupModal";

const mxn = (n) =>
    Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
        Number(n || 0)
    );

function isPickupWarningDate(date) {
    if (!date) return false;
    return date.endsWith("-05-09") || date.endsWith("-05-10");
}

export default function CartItem({ item }) {
    const { dispatch } = useGlobalContext();
    const { product, price, options } = item || {};

    const isChetos = useMemo(
        () => item?.id === "chetos" || product?.id === "chetos",
        [item?.id, product?.id]
    );

    const chetosPapas = item?.deliveryAddress?.chetos_papas || "";

    const initialMode =
        item?.deliveryAddress?.mode === "delivery" ? "delivery" : "pickup";

    const [deliveryMode, setDeliveryMode] = useState(initialMode);
    const [pickupModalOpen, setPickupModalOpen] = useState(false);
    const [pickupWarningAcknowledged, setPickupWarningAcknowledged] =
        useState(false);

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

        if (
            mode === "delivery" &&
            isPickupWarningDate(options?.date) &&
            !pickupWarningAcknowledged
        ) {
            setPickupModalOpen(true);
        }
    };

    const handleChetosPapasChange = (e) => {
        syncAddress({ chetos_papas: e.target.value });
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
                    note: sim.valid
                        ? sim.note ?? ""
                        : sim.message ?? "Ingresa un CP válido de 5 dígitos.",
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

    const changeToPickup = () => {
        setDeliveryMode("pickup");
        syncAddress({ mode: "pickup" });
    };

    return (
        <article className="border-b border-gray-100 py-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="grid grid-cols-[56px,1fr] md:grid-cols-[72px,1fr,auto] gap-3 md:gap-4 items-start">
                        <img
                            src={item?.image}
                            alt={product?.name || "Producto"}
                            className="h-14 w-14 md:h-18 md:w-18 rounded-lg object-cover"
                        />

                        <div className="min-w-0">
                            <h3 className="text-base font-semibold text-gray-900 truncate">
                                {product?.name}
                            </h3>

                            {product?.subtitle && (
                                <p className="text-sm text-gray-500 truncate">
                                    {product?.subtitle}
                                </p>
                            )}
                        </div>

                        <div className="hidden md:flex items-start justify-end">
              <span className="inline-flex rounded-full bg-black/90 text-white px-3 py-1 text-sm font-semibold">
                {mxn(price)}
              </span>
                        </div>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                        {options?.city?.city && (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                {options.city.city}
              </span>
                        )}

                        {options?.date && (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                {options.date}
              </span>
                        )}
                    </div>

                    <div className="mt-2 flex md:hidden justify-end">
            <span className="inline-flex rounded-full bg-black/90 text-white px-3 py-1 text-sm font-semibold">
              {mxn(price)}
            </span>
                    </div>
                </div>

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

            {isChetos ? (
                <div className="rounded-xl border border-gray-200 p-3 md:p-4 space-y-2">
                    <div className="text-sm font-semibold text-gray-900">
                        ¿Qué papas quieres mandar con tus chetos?
                    </div>

                    <textarea
                        rows={3}
                        value={chetosPapas}
                        onChange={handleChetosPapasChange}
                        placeholder="Ej: Doritos Nacho, Cheetos Flamin Hot, Takis morados, Sabritas adobadas..."
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
                    />
                </div>
            ) : null}

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

            <PickupModal
                open={pickupModalOpen}
                onClose={() => {
                    setPickupWarningAcknowledged(true);
                    setPickupModalOpen(false);
                }}
                onAccept={() => {
                    setPickupWarningAcknowledged(true);
                    setPickupModalOpen(false);
                    changeToPickup();
                }}
            />
        </article>
    );
}

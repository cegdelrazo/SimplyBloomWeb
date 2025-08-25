"use client";

import { useMemo } from "react";
import { useGlobalContext } from "@/app/context/globalContext";

const TAX_RATE = 0.16; // IVA 16% MX

function money(n = 0) {
    return n.toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 0,
    });
}

export default function CostSummary() {
    const {
        state: { cart },
    } = useGlobalContext();

    const {
        productSubtotal,
        shippingTotal,
        subtotal,
        iva,
        total,
        pendingShippingLineIds,
        lines,
    } = useMemo(() => {
        const lines = [];
        let productSubtotal = 0;
        let shippingTotal = 0;
        const pendingShippingLineIds = [];

        for (const it of cart.cartItems) {
            const qty = Number(it.quantity || 1);

            // productos
            const lineProducts = (it.price || 0) * qty;
            productSubtotal += lineProducts;

            // envío por ÍTEM (por ramo). Si qty>1, multiplica.
            let lineShipping = 0;
            const isDelivery = it?.deliveryAddress?.mode === "delivery";
            if (isDelivery) {
                if (it?.shipping?.valid) {
                    const unitShipping = Number(it.shipping.cost || 0);
                    lineShipping = unitShipping * qty; // ⬅️ por ramo
                    shippingTotal += lineShipping;
                } else {
                    pendingShippingLineIds.push(it.lineId);
                }
            }

            lines.push({
                lineId: it.lineId,
                name: it?.product?.name || it?.name || "Producto",
                qty,
                lineProducts,
                isDelivery,
                shipping: it?.shipping,
                lineShipping,
            });
        }

        const subtotal = productSubtotal + shippingTotal;
        const iva = Math.round(subtotal * TAX_RATE);
        const total = subtotal + iva;

        return {
            productSubtotal,
            shippingTotal,
            subtotal,
            iva,
            total,
            pendingShippingLineIds,
            lines,
        };
    }, [cart.cartItems]);

    return (
        <div className="space-y-4">
            {/* Desglose por ítem */}
            <ul className="divide-y divide-gray-100">
                {lines.map((ln) => (
                    <li key={ln.lineId} className="py-3">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {ln.name}
                                    {ln.qty > 1 && (
                                        <span className="ml-1 text-gray-500 font-normal">× {ln.qty}</span>
                                    )}
                                </p>

                                <p className="text-xs text-gray-500">
                                    Productos: {money(ln.lineProducts)}
                                </p>

                                {ln.isDelivery ? (
                                    ln.shipping?.valid ? (
                                        <p className="text-xs text-emerald-700">
                                            Envío: {money(ln.lineShipping)}
                                            {ln.shipping?.zone ? ` · ${ln.shipping.zone}` : ""}
                                            {ln.shipping?.etaDays ? ` · ${ln.shipping.etaDays}` : ""}
                                        </p>
                                    ) : (
                                        <p className="text-xs text-amber-700">
                                            Envío pendiente: agrega C.P. válido en la dirección.
                                        </p>
                                    )
                                ) : (
                                    <p className="text-xs text-gray-500">Pickup (sin costo de envío)</p>
                                )}
                            </div>

                            <div className="text-sm font-medium text-gray-900 tabular-nums">
                                {money(ln.lineProducts + ln.lineShipping)}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            {/* Totales */}
            <div className="border-t pt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                    <span className="text-gray-600">Subtotal productos</span>
                    <span className="tabular-nums">{money(productSubtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-600">Envío</span>
                    <span className="tabular-nums">{money(shippingTotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="tabular-nums">{money(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-600">IVA (16%)</span>
                    <span className="tabular-nums">{money(iva)}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-base font-semibold text-gray-900">Total</span>
                    <span className="text-base font-semibold text-gray-900 tabular-nums">
            {money(total)}
          </span>
                </div>
            </div>

            {/* Aviso si falta envío en algún ítem */}
            {pendingShippingLineIds.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    Tienes artículos con envío pendiente por C.P. — el total podría cambiar.
                </div>
            )}
        </div>
    );
}
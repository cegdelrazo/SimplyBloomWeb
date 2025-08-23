"use client";

import { useMemo } from "react";
import CartItem from "./CartItem";
import Link from "next/link";

const VAT_RATE = 0.16;

export default function CartList({ items, onSaveAddress, onSetShipping, onRemove }) {
    const subtotal = useMemo(
        () => items.reduce((acc, it) => acc + it.price * (it.quantity ?? 1), 0),
        [items]
    );
    const shippingTotal = useMemo(
        () => items.reduce((acc, it) => acc + (it.shipping?.cost || 0), 0),
        [items]
    );
    const iva = useMemo(() => Math.round(subtotal * VAT_RATE), [subtotal]);
    const total = useMemo(() => subtotal + iva + shippingTotal, [subtotal, iva, shippingTotal]);

    return (
        <section className="container max-w-3xl mx-auto px-4 py-6 space-y-4">
            {items.map((it) => (
                <CartItem
                    key={it.id}
                    item={it}
                    onSaveAddress={onSaveAddress}
                    onSetShipping={onSetShipping}
                    onRemove={onRemove}
                />
            ))}

            {/* Resumen */}
            <div className="mt-4 rounded-2xl border bg-white p-4 md:p-6">
                <h4 className="text-base md:text-lg font-semibold text-gray-900">Resumen</h4>
                <div className="mt-3 space-y-2 text-sm text-gray-700">
                    <Row label="Subtotal" value={subtotal} />
                    <Row label="IVA (16%)" value={iva} />
                    <Row label="Envío (por producto)" value={shippingTotal} />
                    <div className="h-px bg-gray-200 my-2" />
                    <Row label="Total" value={total} strong />
                </div>

                <div className="mt-5 text-right">
                    <Link
                        href="/checkout"
                        className="inline-flex items-center gap-2 rounded-full bg-brand-pink px-8 py-2 text-white font-semibold
                       shadow-md hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-pink"
                    >
                        Proceder al pago →
                    </Link>
                </div>
            </div>
        </section>
    );
}

function Row({ label, value, strong = false }) {
    return (
        <div className="flex items-center justify-between">
            <span className={`text-gray-600 ${strong ? "font-semibold text-gray-800" : ""}`}>{label}</span>
            <span className={`${strong ? "text-lg font-semibold text-gray-900" : ""}`}>
        ${Number(value || 0).toLocaleString("es-MX")}
      </span>
        </div>
    );
}
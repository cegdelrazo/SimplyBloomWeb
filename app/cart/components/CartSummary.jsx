"use client";

import Link from "next/link";

const VAT_RATE = 0.16;

export default function CartSummary({ items = [] }) {
    const subtotal = items.reduce((acc, it) => acc + it.price * (it.quantity ?? 1), 0);
    const shippingTotal = items.reduce((acc, it) => acc + (it.shipping?.cost || 0), 0);

    // IVA sobre productos + envío
    const taxable = subtotal + shippingTotal;
    const iva = Math.round(taxable * VAT_RATE); // usa Math.round para pesos enteros
    const total = subtotal + shippingTotal + iva;

    return (
        <section className="rounded-2xl border bg-white p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900">Resumen</h3>

            <div className="mt-4 space-y-2 text-sm text-gray-700">
                <Row label="Subtotal" value={subtotal} />
                <Row label="Envío (por producto)" value={shippingTotal} />
                <Row label="IVA (16%)" value={iva} />
                <div className="h-px bg-gray-200 my-2" />
                <Row label="Total" value={total} strong />
            </div>

            <div className="mt-5">
                <Link
                    href="/checkout"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-pink px-8 py-3 text-white font-semibold
                     shadow-md hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-pink"
                >
                    Proceder al pago →
                </Link>
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
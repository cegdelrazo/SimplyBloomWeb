"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

/**
 * Página de "Gracias por tu compra / Paga aquí".
 *
 * • Muestra confirmación amigable
 * • Resumen de la orden
 * • CTA para pagar (Stripe u otro)
 * • Acciones útiles (copiar ID, ver/descargar recibo, regresar al home)
 *
 * Cómo usarla
 * 1) Pon este archivo como: app/order/[orderId]/page.jsx (App Router)
 * 2) Tu backend debería exponer GET /orders/{orderId} que regrese la orden creada.
 *    - O bien, puedes hidratar desde sessionStorage/localStorage si aún no tienes endpoint.
 * 3) Pasa opcionalmente ?paymentUrl=https://... para que el botón "Pagar ahora" redirija ahí.
 */

/* ==========================
 *  Utilidades
 * =========================*/
const MXN = (n = 0) =>
    (Number(n) || 0).toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 0,
    });

const fallbackLogo = (
    <svg viewBox="0 0 48 48" className="h-8 w-8 text-gray-900" fill="currentColor">
        <circle cx="24" cy="24" r="24" className="opacity-5" />
        <path d="M14 30c6 2 14 2 20 0v-2c-6 2-14 2-20 0v2Zm0-6c6 2 14 2 20 0v-2c-6 2-14 2-20 0v2Zm0-6c6 2 14 2 20 0v-2c-6 2-14 2-20 0v2Z" />
    </svg>
);

function CopyBadge({ text }) {
    const [copied, setCopied] = useState(false);
    return (
        <button
            onClick={async () => {
                try {
                    await navigator.clipboard.writeText(text || "");
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1800);
                } catch (_) {}
            }}
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs hover:bg-gray-50"
            title="Copiar"
        >
            <span className="font-mono text-[11px] text-gray-700 truncate max-w-[160px]">{text}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] ${copied ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600"}`}>
        {copied ? "Copiado" : "Copiar"}
      </span>
        </button>
    );
}

/* ==========================
 *  Fetch de la orden (mock/simple)
 * =========================*/
async function fetchOrder(orderId) {
    // 1) Intenta leer del backend (si existe)
    try {
        const base = process.env.NEXT_PUBLIC_ORDER_API_BASE; // p.ej. https://api.tu-dominio.com
        if (base && orderId) {
            const r = await fetch(`${base}/orders/${orderId}`, { cache: "no-store" });
            if (r.ok) return await r.json();
        }
    } catch (_) {}

    // 2) Fallback: intenta de sessionStorage (guardado tras crear la orden)
    try {
        const raw = sessionStorage.getItem("lastOrderPayload");
        if (raw) return JSON.parse(raw);
    } catch (_) {}

    return null;
}

/* ==========================
 *  Página principal
 * =========================*/
export default function GraciasPage({ params, searchParams }) {
    const orderIdFromRoute = params?.orderId;
    const paymentUrlFromQuery = searchParams?.paymentUrl;

    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState(null);
    const [error, setError] = useState(null);

    // Carga inicial
    useEffect(() => {
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchOrder(orderIdFromRoute);
                setOrder(data);
            } catch (e) {
                setError("No pudimos cargar tu orden. Guarda tu ID y contáctanos.");
            } finally {
                setLoading(false);
            }
        })();
    }, [orderIdFromRoute]);

    const totals = useMemo(() => {
        // Si tu backend ya calcula totales, usa esos; esto es por si sólo llega el payload que armamos del carrito.
        if (!order) return { subtotal: 0, iva: 0, envio: 0, total: 0 };

        // Intenta leer de order.total si existe
        const direct = order?.totals || order?.total ? {
            subtotal: order?.totals?.subtotal ?? 0,
            iva: order?.totals?.iva ?? 0,
            envio: order?.totals?.shipping ?? 0,
            total: order?.total ?? (order?.totals?.total ?? 0),
        } : null;
        if (direct) return direct;

        // Auto-cálculo muy básico (sólo para mostrar algo)
        const TAX_RATE = 0.16;
        const productSubtotal = (order?.cartItems || []).reduce((acc, it) => acc + (it.price || 0) * (it.quantity || 1), 0);
        const shipping = (order?.cartItems || []).reduce((acc, it) => acc + (it.delivery?.shippingCost || 0), 0);
        const subtotal = productSubtotal + shipping;
        const iva = Math.round(subtotal * TAX_RATE);
        const total = subtotal + iva;
        return { subtotal, iva, envio: shipping, total };
    }, [order]);

    const paymentUrl = paymentUrlFromQuery || order?.paymentUrl || process.env.NEXT_PUBLIC_FALLBACK_PAYMENT_URL || "";

    return (
        <div className="min-h-[100dvh] bg-white">
            {/* Header */}
            <header className="border-b">
                <div className="mx-auto max-w-4xl px-4 py-4 flex items-center gap-3">
                    {fallbackLogo}
                    <div className="text-sm text-gray-600">Gracias por tu compra</div>
                </div>
            </header>

            <main className="mx-auto max-w-4xl px-4 py-8">
                {/* Hero */}
                <div className="flex items-start gap-4">
                    <div className="shrink-0 rounded-full bg-emerald-100 text-emerald-700 p-2">
                        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" /></svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">¡Orden creada con éxito!</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Guarda tu ID de orden. Te enviamos un correo con el resumen y los siguientes pasos.
                        </p>
                        <div className="mt-3">
                            <CopyBadge text={order?.orderId || orderIdFromRoute || ""} />
                        </div>
                    </div>
                </div>

                {/* Estado de carga / error */}
                {loading && (
                    <div className="mt-8 text-sm text-gray-600">Cargando resumen…</div>
                )}
                {error && (
                    <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 text-sm">
                        {error}
                    </div>
                )}

                {/* Grid principal */}
                {!loading && (
                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Columna izquierda: resumen de ítems */}
                        <section className="lg:col-span-2 space-y-4">
                            <div className="rounded-2xl border p-4">
                                <h2 className="text-sm font-semibold text-gray-900">Resumen de la orden</h2>
                                <div className="mt-3 divide-y">
                                    {(order?.cartItems || []).map((it, idx) => (
                                        <div key={it.itemId || idx} className="py-3 flex items-start gap-3">
                                            <div className="h-14 w-14 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                                                {/* Si tienes URL de imagen del producto, úsala aquí */}
                                                <span className="text-xs text-gray-500">{(it?.images?.[0]?.type || "img").split("/")[1]?.toUpperCase() || "IMG"}</span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-3">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {it?.name || it?.idBouquet || `Artículo ${idx + 1}`}
                                                    </p>
                                                    {it?.quantity ? (
                                                        <span className="text-xs text-gray-500">× {it.quantity}</span>
                                                    ) : null}
                                                </div>
                                                {it?.message?.title || it?.message?.message ? (
                                                    <p className="mt-0.5 text-xs text-gray-600 line-clamp-2">
                                                        {it?.message?.title}
                                                        {it?.message?.title && it?.message?.message ? " — " : ""}
                                                        {it?.message?.message}
                                                    </p>
                                                ) : null}
                                                {it?.delivery?.deliveryMode ? (
                                                    <p className="mt-1 text-[11px] text-gray-500">
                                                        Entrega: <strong className="text-gray-700">{it.delivery.deliveryMode === "delivery" ? "Envío a domicilio" : "Pickup"}</strong>
                                                        {it?.delivery?.date ? ` • ${it.delivery.date}` : ""}
                                                    </p>
                                                ) : null}
                                                {Array.isArray(it?.images) && it.images.length > 0 && (
                                                    <p className="mt-1 text-[11px] text-gray-500">Imágenes adjuntas: {it.images.length}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {(!order?.cartItems || order.cartItems.length === 0) && (
                                        <div className="py-6 text-sm text-gray-500">No encontramos artículos para mostrar.</div>
                                    )}
                                </div>
                            </div>

                            {/* Datos del comprador */}
                            <div className="rounded-2xl border p-4">
                                <h2 className="text-sm font-semibold text-gray-900">Datos del comprador</h2>
                                <div className="mt-2 text-sm text-gray-700">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <div>
                                            <div className="text-gray-500 text-xs">Nombre</div>
                                            <div>{order?.buyer?.name || "—"}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-500 text-xs">Teléfono</div>
                                            <div>{order?.buyer?.phone || "—"}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-500 text-xs">Email</div>
                                            <div>{order?.buyer?.email || "—"}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-500 text-xs">Ciudad</div>
                                            <div className="capitalize">{order?.city || "—"}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Columna derecha: pagar + totales */}
                        <aside className="space-y-4">
                            <div className="rounded-2xl border p-4">
                                <h3 className="text-sm font-semibold text-gray-900">Total a pagar</h3>
                                <dl className="mt-3 space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <dt className="text-gray-600">Subtotal</dt>
                                        <dd className="tabular-nums">{MXN(totals.subtotal)}</dd>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <dt className="text-gray-600">Envío</dt>
                                        <dd className="tabular-nums">{MXN(totals.envio)}</dd>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <dt className="text-gray-600">IVA</dt>
                                        <dd className="tabular-nums">{MXN(totals.iva)}</dd>
                                    </div>
                                    <div className="pt-2 mt-2 border-t flex items-center justify-between font-semibold">
                                        <dt>Total</dt>
                                        <dd className="tabular-nums">{MXN(totals.total)}</dd>
                                    </div>
                                </dl>

                                <div className="mt-4 space-y-2">
                                    <a
                                        href={paymentUrl || "#"}
                                        target={paymentUrl ? "_blank" : undefined}
                                        rel="noreferrer noopener"
                                        className={`w-full inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold ${paymentUrl ? "bg-gray-900 text-white hover:bg-black" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}
                                        aria-disabled={!paymentUrl}
                                    >
                                        {paymentUrl ? "Pagar ahora" : "Pago no disponible"}
                                    </a>

                                    <Link
                                        href="/"
                                        className="w-full inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold border hover:bg-gray-50"
                                    >
                                        Volver al inicio
                                    </Link>
                                </div>

                                <p className="mt-3 text-[11px] text-gray-500">
                                    Si tu pago ya fue realizado, puedes cerrar esta ventana. Te enviaremos actualizaciones por correo.
                                </p>
                            </div>

                            {/* Ayuda/contacto */}
                            <div className="rounded-2xl border p-4">
                                <h3 className="text-sm font-semibold text-gray-900">¿Necesitas ayuda?</h3>
                                <p className="mt-2 text-sm text-gray-600">
                                    Escríbenos a {process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "soporte@simplybloom.com"}
                                </p>
                            </div>
                        </aside>
                    </div>
                )}
            </main>
        </div>
    );
}

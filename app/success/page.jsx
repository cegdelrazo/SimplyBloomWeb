// app/success/page.js
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

/* ==================== Utils ==================== */
function mxn(n) {
    const v = typeof n === "number" ? n : Number(n ?? 0);
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
    }).format(v);
}

function statusEs(s) {
    const k = (s || "").toUpperCase();
    if (k === "PENDING_PAYMENT") return "Pendiente de pago";
    if (k === "PAY_COMPLETE") return "Pago completado";
    if (k === "PROCESSING") return "Procesando orden";
    if (k === "SHIPPED") return "En camino";
    if (k === "DELIVERED") return "Entregada";
    if (k === "CANCELLED") return "Cancelada";
    if (k === "FAILED") return "Fallida";
    if (k === "REFUNDED") return "Reembolsada";
    return s || "—";
}

function titleByStatus(k) {
    if (k === "PENDING_PAYMENT") return "Orden creada";
    if (k === "PAY_COMPLETE") return "Pago completado";
    if (k === "PROCESSING") return "Procesando orden";
    if (k === "SHIPPED") return "Pedido en camino";
    if (k === "DELIVERED") return "Pedido entregado";
    if (k === "CANCELLED") return "Orden cancelada";
    if (k === "FAILED") return "Pago fallido";
    return "Estado de tu orden";
}

/* ==================== Timeline (verde, simplificada) ==================== */
// Solo: PENDING_PAYMENT -> PAY_COMPLETE -> DELIVERED
const STATUS_ORDER = ["PENDING_PAYMENT", "PAY_COMPLETE", "DELIVERED"];
const LABELS = {
    PENDING_PAYMENT: "Orden creada",
    PAY_COMPLETE: "Pago completado",
    DELIVERED: "Entregada",
};
// PROCESSING/SHIPPED se muestran como PAY_COMPLETE para no romper la vista
const TIMELINE_FALLBACK = {
    PROCESSING: "PAY_COMPLETE",
    SHIPPED: "PAY_COMPLETE",
};

function circleClass(state) {
    if (state === "done") return "bg-emerald-600 text-white border-emerald-600";
    if (state === "current") return "bg-emerald-500 text-white border-emerald-500";
    return "bg-gray-200 text-gray-500 border-gray-200";
}
function barClass(state) {
    if (state === "done") return "bg-emerald-200";
    if (state === "current") return "bg-emerald-300";
    return "bg-gray-200";
}

function OrderTimeline({ status }) {
    const raw = String(status || "").toUpperCase();
    const normalized = STATUS_ORDER.includes(raw)
        ? raw
        : TIMELINE_FALLBACK[raw] || "PENDING_PAYMENT";
    const currentIdx = STATUS_ORDER.indexOf(normalized);

    return (
        <div className="rounded-2xl border bg-white shadow-sm p-5">
            <ol className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {STATUS_ORDER.map((s, i) => {
                    const isDone = i < currentIdx;
                    const isCurrent = i === currentIdx;
                    const state = isDone ? "done" : isCurrent ? "current" : "upcoming";
                    return (
                        <li key={s} className="flex items-center sm:flex-1 gap-3">
                            <div
                                className={`h-8 w-8 rounded-full border grid place-items-center text-xs font-semibold ${circleClass(
                                    state
                                )}`}
                            >
                                {i + 1}
                            </div>
                            <div
                                className={`text-sm ${
                                    isDone || isCurrent ? "text-gray-900" : "text-gray-500"
                                }`}
                            >
                                {LABELS[s]}
                            </div>
                            {i < STATUS_ORDER.length - 1 && (
                                <div
                                    className={`hidden sm:block flex-1 h-0.5 mx-3 rounded ${barClass(
                                        isDone ? "done" : isCurrent ? "current" : "upcoming"
                                    )}`}
                                />
                            )}
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}

/* ==================== Thumbs strip ==================== */
function Thumbs({ images = [] }) {
    const list = Array.isArray(images) ? images : [];
    if (list.length === 0) {
        return (
            <div className="w-full rounded-xl bg-gray-50 grid place-content-center text-gray-400 text-sm h-16">
                Sin imágenes
            </div>
        );
    }
    return (
        <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 py-1">
            {list.map((img, idx) => (
                <div
                    key={idx}
                    className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border"
                    title={img.originalName || `imagen ${idx + 1}`}
                >
                    <img
                        src={img.signedUrl}
                        alt={`miniatura ${idx + 1}`}
                        className="w-full h-full object-cover"
                    />
                </div>
            ))}
        </div>
    );
}

/* ==================== Item Card ==================== */
function ItemCard({ it }) {
    const images = Array.isArray(it.images) ? it.images : [];
    const isDelivery = it?.delivery?.deliveryMode === "delivery";
    const address = it?.delivery?.address;

    const p = it?.product || {};
    const productName = p?.name;
    const productSubtitle = p?.subtitle;
    const productId = p?.id;

    return (
        <li className="rounded-2xl border bg-white shadow-sm p-5">
            <div className="space-y-1">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            {it.bouquetName}
                        </h3>
                        {productName && (
                            <div className="mt-0.5">
                                <div className="text-sm text-gray-800">
                                    Plantilla ({productName})
                                </div>
                                {productSubtitle && (
                                    <div className="text-xs text-gray-500">
                                        Plantilla ({productSubtitle})
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    {productId && (
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs text-gray-600 bg-gray-50">
              {String(productId)}
            </span>
                    )}
                </div>

                <p className="text-sm text-gray-600">
                    {it.deliveryMode === "pickup" ? "Recoger" : "Envío"} —{" "}
                    {it.deliveryDate || "—"}
                </p>
            </div>

            {isDelivery && (
                <div className="mt-4 rounded-xl bg-gray-50 border p-4 text-sm text-gray-700 space-y-1">
                    <div className="font-medium">Entrega a domicilio</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                        <div>
                            <span className="text-gray-500">Nombre:</span>{" "}
                            {it?.delivery?.name || "—"}
                        </div>
                        <div>
                            <span className="text-gray-500">Teléfono:</span>{" "}
                            {it?.delivery?.phone || "—"}
                        </div>
                        <div className="sm:col-span-2">
                            <span className="text-gray-500">Dirección:</span>{" "}
                            {address
                                ? `${address.street || ""} ${address.number || ""}, ${
                                    address.town || ""
                                }, CP ${address.cp || ""}`
                                : "—"}
                        </div>
                    </div>
                </div>
            )}

            {(it?.message?.title || it?.message?.message) && (
                <div className="mt-4">
                    <div className="text-sm text-gray-500">Mensaje</div>
                    <div className="rounded-xl border p-3 text-sm bg-gray-50">
                        {it?.message?.title && (
                            <div className="font-medium">{it.message.title}</div>
                        )}
                        {it?.message?.message && (
                            <div className="mt-1 text-gray-700 whitespace-pre-wrap">
                                {it.message.message}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="mt-4">
                <Thumbs images={images} />
            </div>
        </li>
    );
}

/* ==================== Client Component ==================== */
function SuccessClient() {
    const search = useSearchParams();
    const orderId = search.get("orderId");
    const sessionId = search.get("session_id") || search.get("sessionId");

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    useEffect(() => {
        async function run() {
            const base = process.env.NEXT_PUBLIC_API_URL;
            if (!base) {
                setErr("Falta NEXT_PUBLIC_API_URL");
                setLoading(false);
                return;
            }
            if (!orderId && !sessionId) {
                setErr("Falta orderId o session_id en la URL");
                setLoading(false);
                return;
            }

            // Construye endpoint
            const url = orderId
                ? `${base}/orders/${encodeURIComponent(orderId)}`
                : `${base}/orders?session_id=${encodeURIComponent(sessionId)}`;

            try {
                const res = await fetch(url, { cache: "no-store" });
                if (!res.ok) {
                    const t = await res.text().catch(() => "");
                    throw new Error(`Error ${res.status} ${t || ""}`.trim());
                }
                const data = await res.json();

                // Normalización
                let orderObj;
                if (orderId) {
                    orderObj = data;
                } else {
                    const list = Array.isArray(data?.items) ? data.items : [];
                    orderObj =
                        list.find((o) => o?.payment?.sessionId === sessionId) ||
                        list[0] ||
                        null;
                }

                if (!orderObj) {
                    setErr("No se encontró la orden para ese session_id.");
                    setOrder(null);
                } else {
                    setOrder(orderObj);
                }
            } catch (e) {
                console.error(e);
                setErr("No se pudo cargar la orden.");
                setOrder(null);
            } finally {
                setLoading(false);
            }
        }
        run();
    }, [orderId, sessionId]);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-8 animate-pulse space-y-4">
                <div className="h-9 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-40 bg-gray-200 rounded" />
            </div>
        );
    }

    if (err)
        return <div className="max-w-4xl mx-auto p-8 text-brand-pink">{err}</div>;
    if (!order) return <div className="max-w-4xl mx-auto p-8">Sin datos de orden.</div>;

    const statusKey = (order?.status || "").toUpperCase();
    const amounts = order?.amounts || {};
    const canPay = statusKey === "PENDING_PAYMENT" && !!order?.payment?.checkoutUrl;

    const statusText = statusEs(order?.status);
    const title = titleByStatus(statusKey);

    return (
        <div className="max-w-6xl mx-auto p-6 sm:p-10 space-y-10 animate-fadeIn">
            <section className="rounded-2xl border bg-white shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-brand-pink">
                            {title}
                        </h1>
                        <p className="text-sm text-gray-600">
                            Número de orden: <b>{order.orderId}</b>
                        </p>
                        {order._resolvedBy && (
                            <p className="text-xs text-gray-400">
                                fuente: {order._resolvedBy === "orderId" ? "orderId" : "session_id"}
                            </p>
                        )}
                        <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">
                            {statusText}
                        </p>
                    </div>
                    {canPay && (
                        <a
                            href={order.payment.checkoutUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full bg-brand-pink text-white px-6 py-3 text-sm font-medium shadow hover:opacity-90 transition"
                        >
                            Ir a pagar
                        </a>
                    )}
                </div>
            </section>

            <OrderTimeline status={order.status} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <section className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-brand-pink">Artículos</h2>
                        <span className="text-xs text-gray-500">
              {Array.isArray(order.items) ? order.items.length : 0} ítem(s)
            </span>
                    </div>

                    <ul className="space-y-6">
                        {(order.items || []).map((it, i) => (
                            <ItemCard key={i} it={it} />
                        ))}
                    </ul>
                </section>

                <aside className="space-y-8">
                    <div className="rounded-2xl border bg-white shadow-sm p-6 space-y-3">
                        <h2 className="text-lg font-semibold text-brand-pink">
                            Resumen de la orden
                        </h2>
                        <div className="text-sm text-gray-700 space-y-1">
                            <div>
                                <span className="text-gray-500">Estatus:</span>{" "}
                                {statusEs(order.status)}
                            </div>
                            <div>
                                <span className="text-gray-500">Ciudad:</span>{" "}
                                {order?.city?.toUpperCase?.()}
                            </div>
                            <div>
                                <span className="text-gray-500">Contacto:</span>{" "}
                                {order?.buyer?.name}
                            </div>
                            <div>
                                <span className="text-gray-500">Email:</span>{" "}
                                {order?.buyer?.email}
                            </div>
                            <div>
                                <span className="text-gray-500">Teléfono:</span>{" "}
                                {order?.buyer?.phone}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border bg-white shadow-sm p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-brand-pink">
                            Resumen de pago
                        </h2>
                        <div className="text-sm text-gray-700 space-y-2">
                            <div className="flex items-center justify-between">
                                <span>Subtotal productos</span>
                                <b>{mxn(amounts.productsSubtotal)}</b>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Envío</span>
                                <b>{mxn(amounts.shippingTotal)}</b>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Base gravable</span>
                                <b>{mxn(amounts.taxBase)}</b>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>IVA</span>
                                <b>{mxn(amounts.iva)}</b>
                            </div>
                            <div className="h-px bg-gray-200 my-2" />
                            <div className="flex items-center justify-between text-lg">
                                <span>Total</span>
                                <b>{mxn(amounts.grandTotal)}</b>
                            </div>
                        </div>

                        <div className="pt-2">
                            {canPay ? (
                                <a
                                    href={order.payment.checkoutUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full inline-flex items-center justify-center rounded-full bg-brand-pink text-white px-6 py-3 text-sm font-medium shadow hover:opacity-90 transition"
                                >
                                    Ir a pagar
                                </a>
                            ) : (
                                <a
                                    href="/"
                                    className="w-full inline-flex items-center justify-center rounded-full border px-6 py-3 text-sm hover:bg-gray-50 transition"
                                >
                                    Volver al inicio
                                </a>
                            )}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

/* ==================== Page Wrapper ==================== */
// Evita prerender estático y agrega Suspense alrededor del componente que usa useSearchParams
export const dynamic = "force-dynamic";
export const metadata = { title: "Success" };

export default function SuccessPage() {
    return (
        <Suspense fallback={<div className="max-w-4xl mx-auto p-8">Cargando…</div>}>
            <SuccessClient />
        </Suspense>
    );
}
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

/* ========= Utils ========= */
const STATUS_ORDER = ["PENDING_PAYMENT", "PAY_COMPLETE", "DELIVERED"];
const STATUS_LABELS = {
    PENDING_PAYMENT: "Pendiente de pago",
    PAY_COMPLETE: "Pago completado",
    PROCESSING: "Procesando orden",
    SHIPPED: "En camino",
    DELIVERED: "Entregada",
    CANCELLED: "Cancelada",
    FAILED: "Fallida",
    REFUNDED: "Reembolsada",
};

// Ítems
const ITEM_STATUS_LABELS = {
    delivered: "Entregado",
    undelivered: "No entregado",
};
const itemStatusBadge = (s) =>
    s === "delivered"
        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
        : "bg-amber-100 text-amber-800 border border-amber-200";

function mxn(n) {
    const v = typeof n === "number" ? n : Number(n ?? 0);
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(v);
}

function normalizeMxPhoneToWa(phoneRaw) {
    const digits = String(phoneRaw || "").replace(/\D/g, "");
    if (!digits) return "";
    const withCountry = digits.startsWith("52") ? digits : `52${digits}`;
    return `https://wa.me/${withCountry}`;
}

function buildWaUrl(phone, orderId, buyerName) {
    const base = normalizeMxPhoneToWa(phone);
    if (!base) return "";
    const text = `Hola ${buyerName || ""}. Te contacto sobre tu pedido ${orderId ? "#" + orderId : ""}.`.trim();
    return `${base}?text=${encodeURIComponent(text)}`;
}

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
                <div key={idx} className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border">
                    <img src={img.signedUrl} alt={`miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
            ))}
        </div>
    );
}

function ItemCard({ it, orderId, adminKey, onError, onDelivered }) {
    const images = Array.isArray(it?.images) ? it.images : [];
    const isDelivery = it?.delivery?.deliveryMode === "delivery";
    const address = it?.delivery?.address;
    const [downloading, setDownloading] = useState(false);
    const [marking, setMarking] = useState(false);

    async function downloadZip() {
        try {
            setDownloading(true);
            const base = process.env.NEXT_PUBLIC_API_URL;
            if (!base) throw new Error("Falta NEXT_PUBLIC_API_URL");
            const url = `${base}/orders/${encodeURIComponent(orderId)}/items/${encodeURIComponent(it.itemId)}/zip`;
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-admin-key": adminKey || "",
                },
            });
            if (!res.ok) throw new Error(`Error ${res.status}`);
            const data = await res.json(); // { url }
            if (!data?.url) throw new Error("Respuesta inválida");
            window.open(data.url, "_blank", "noopener,noreferrer");
        } catch (e) {
            console.error(e);
            onError?.("No se pudo generar el ZIP de imágenes.");
        } finally {
            setDownloading(false);
        }
    }

    async function deliverItem() {
        try {
            setMarking(true);
            const base = process.env.NEXT_PUBLIC_API_URL;
            if (!base) throw new Error("Falta NEXT_PUBLIC_API_URL");

            // Ajusta la ruta/cuerpo si tu lambda usa otro contrato
            const res = await fetch(
                `${base}/orders/${encodeURIComponent(orderId)}/items/${encodeURIComponent(it.itemId)}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "x-admin-key": adminKey || "",
                    },
                    body: JSON.stringify({ itemStatus: "delivered" }),
                }
            );
            if (!res.ok) throw new Error(`Error ${res.status}`);
            // Opcional: leer la respuesta por si devuelve el item actualizado
            // const data = await res.json();

            onDelivered?.(it.itemId);
        } catch (e) {
            console.error(e);
            onError?.("No se pudo marcar el ítem como entregado.");
        } finally {
            setMarking(false);
        }
    }

    const prod = it?.product || {};
    const pName = prod?.name || "";
    const pSubtitle = prod?.subtitle || "";
    const pId = prod?.id || "";
    const itemStatus = (it?.itemStatus || "").toLowerCase();

    const canDeliver = itemStatus !== "delivered";

    return (
        <li className="rounded-2xl border bg-white shadow-sm p-5">
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-gray-900">{it?.bouquetName || "—"}</h3>
                    {(pName || pSubtitle || pId) && (
                        <div className="text-sm">
                            {pName && <div className="text-gray-900 font-medium">Plantilla: {pName}</div>}
                            {pSubtitle && <div className="text-gray-600">{pSubtitle}</div>}
                            {pId && (
                                <div className="mt-1 inline-flex items-center gap-2 text-xs">
                                    <span className="px-2 py-0.5 rounded-full bg-gray-100 border text-gray-700">Producto ID: {pId}</span>
                                </div>
                            )}
                        </div>
                    )}
                    <p className="text-sm text-gray-600">
                        {it?.deliveryMode === "pickup" ? "Recoger" : "Envío"} — {it?.deliveryDate || it?.delivery?.date || "—"}
                    </p>
                </div>

                {/* Badge de estatus del ítem */}
                <span className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold ${itemStatusBadge(itemStatus)}`}>
          {ITEM_STATUS_LABELS[itemStatus] || "—"}
        </span>
            </div>

            {isDelivery && (
                <div className="mt-4 rounded-xl bg-gray-50 border p-4 text-sm text-gray-700 space-y-1">
                    <div className="font-medium">Entrega a domicilio</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                        <div>
                            <span className="text-gray-500">Nombre:</span> {it?.delivery?.name || "—"}
                        </div>
                        <div>
                            <span className="text-gray-500">Teléfono:</span> {it?.delivery?.phone || "—"}
                        </div>
                        <div className="sm:col-span-2">
                            <span className="text-gray-500">Dirección:</span>{" "}
                            {address
                                ? `${address.street || ""} ${address.number || ""}, ${address.town || ""}, CP ${address.cp || ""}`
                                : "—"}
                        </div>
                    </div>
                </div>
            )}

            {(it?.message?.title || it?.message?.message) && (
                <div className="mt-4">
                    <div className="text-sm text-gray-500">Mensaje</div>
                    <div className="rounded-xl border p-3 text-sm bg-gray-50">
                        {it?.message?.title && <div className="font-medium">{it.message.title}</div>}
                        {it?.message?.message && (
                            <div className="mt-1 text-gray-700 whitespace-pre-wrap">{it.message.message}</div>
                        )}
                    </div>
                </div>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-gray-600">Precio unitario: {mxn(it?.unitPrice)}</div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        disabled={downloading || images.length === 0}
                        onClick={downloadZip}
                        className={`rounded-full px-4 py-2 text-sm font-medium border ${
                            downloading || images.length === 0
                                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                : "bg-white hover:bg-gray-50 border-gray-300"
                        }`}
                        title="Descargar imágenes (.zip)"
                    >
                        {downloading ? "Generando ZIP…" : "Descargar imágenes"}
                    </button>

                    <button
                        type="button"
                        disabled={!canDeliver || marking}
                        onClick={deliverItem}
                        className={`rounded-full px-4 py-2 text-sm font-medium ${
                            !canDeliver || marking
                                ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                                : "bg-emerald-600 text-white hover:bg-emerald-700"
                        }`}
                        title="Marcar ítem como entregado"
                    >
                        {marking ? "Marcando…" : "Marcar como entregado"}
                    </button>
                </div>
            </div>

            <div className="mt-4">
                <Thumbs images={images} />
            </div>
        </li>
    );
}

/* ========= Página Admin ========= */
export default function AdminBloomPage() {
    const params = useParams();
    const orderId = params?.orderId;
    const [bloom, setBloom] = useState(null);
    const [amounts, setAmounts] = useState(null);
    const [statusKey, setStatusKey] = useState("");
    const [adminKey, setAdminKey] = useState("");
    const [authOk, setAuthOk] = useState(false);
    const [loading, setLoading] = useState(false);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState("");

    useEffect(() => {
        const k = localStorage.getItem("admin_key") || "";
        if (k) {
            setAdminKey(k);
            setAuthOk(true);
        }
    }, []);

    async function fetchBloom() {
        try {
            setLoading(true);
            const base = process.env.NEXT_PUBLIC_API_URL;
            if (!base) throw new Error("Falta NEXT_PUBLIC_API_URL");
            const res = await fetch(`${base}/orders/${encodeURIComponent(orderId)}`, {
                headers: authOk ? { "x-admin-key": adminKey } : {},
                cache: "no-store",
            });

            if (res.status === 404) {
                localStorage.removeItem("admin_key");
                setAdminKey("");
                setAuthOk(false);
                setErr("");
                setLoading(false);
                return;
            }

            if (!res.ok) throw new Error(`Error ${res.status}`);

            const data = await res.json();
            setBloom(data);
            setAmounts(data?.amounts || {});
            setStatusKey((data?.status || "").toUpperCase());
            setErr("");
        } catch (e) {
            console.error(e);
            setErr("No se pudo cargar la orden.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (authOk && orderId) fetchBloom();
    }, [authOk, adminKey, orderId]);

    function onSaveKey(e) {
        e.preventDefault();
        if (!adminKey.trim()) return;
        localStorage.setItem("admin_key", adminKey.trim());
        setAuthOk(true);
    }

    async function changeStatus(nextStatus) {
        const base = process.env.NEXT_PUBLIC_API_URL;
        try {
            setBusy(true);
            const res = await fetch(`${base}/orders/${encodeURIComponent(orderId)}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "x-admin-key": adminKey,
                },
                body: JSON.stringify({ status: nextStatus }),
            });
            if (!res.ok) throw new Error(`Error ${res.status}`);
            await fetchBloom();
        } catch (e) {
            console.error(e);
            alert("No se pudo actualizar el estatus.");
        } finally {
            setBusy(false);
        }
    }

    // callback para refrescar cuando un ítem se marque como entregado
    async function handleItemDelivered() {
        // Para evitar desincronizar, recargamos la orden completa
        await fetchBloom();
    }

    if (!authOk) {
        return (
            <div className="max-w-md mx-auto p-8 space-y-4">
                <h1 className="text-xl font-semibold">Panel de vendedor</h1>
                <form onSubmit={onSaveKey} className="space-y-3">
                    <label className="block text-sm text-gray-700">Clave de administración</label>
                    <input
                        type="password"
                        value={adminKey}
                        onChange={(e) => setAdminKey(e.target.value)}
                        className="w-full rounded-md border px-3 py-2"
                        placeholder="Ingresa tu clave"
                    />
                    <button type="submit" className="rounded-full bg-brand-pink text-white px-5 py-2 text-sm font-medium">
                        Entrar
                    </button>
                </form>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto p-8 animate-pulse space-y-4">
                <div className="h-9 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-40 bg-gray-200 rounded" />
            </div>
        );
    }

    if (err) return <div className="max-w-5xl mx-auto p-8 text-brand-pink">{err}</div>;
    if (!bloom) return <div className="max-w-5xl mx-auto p-8">Sin datos.</div>;

    const buyer = bloom?.buyer || {};
    const waUrl = buildWaUrl(buyer?.phone, bloom?.orderId, buyer?.name);

    return (
        <div className="max-w-6xl mx-auto p-6 sm:p-10 space-y-8">
            {/* Header + acciones */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-brand-pink">Bloom #{bloom.orderId}</h1>
                    <p className="text-sm text-gray-600">
                        Estatus: <b>{STATUS_LABELS[statusKey] || bloom.status}</b>
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {STATUS_ORDER.map((s) => (
                        <button
                            key={s}
                            disabled={busy || s === statusKey}
                            onClick={() => changeStatus(s)}
                            className={`px-4 py-2 rounded-full text-sm font-medium border ${
                                s === statusKey ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white hover:bg-gray-50 border-gray-300"
                            }`}
                            title={`Cambiar a ${STATUS_LABELS[s]}`}
                        >
                            {STATUS_LABELS[s]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Datos y artículos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <section className="lg:col-span-2 space-y-6">
                    {/* Cliente */}
                    <div className="rounded-2xl border bg-white shadow-sm p-6 space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-brand-pink">Cliente</h2>
                            {waUrl ? (
                                <a
                                    href={waUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-full bg-green-600 text-white px-4 py-2 text-sm font-medium hover:bg-green-700 transition"
                                    title="Enviar WhatsApp"
                                >
                                    <span aria-hidden>🟢</span>
                                    WhatsApp
                                </a>
                            ) : null}
                        </div>

                        <div className="text-sm text-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                            <p>
                                <span className="text-gray-500">Nombre:</span> {buyer?.name || "—"}
                            </p>
                            <p>
                                <span className="text-gray-500">Email:</span> {buyer?.email || "—"}
                            </p>
                            <p>
                                <span className="text-gray-500">Teléfono:</span> {buyer?.phone || "—"}
                            </p>
                            <p>
                                <span className="text-gray-500">Ciudad:</span> {bloom?.city?.toUpperCase?.() || "—"}
                            </p>
                        </div>
                    </div>

                    {/* Items */}
                    <div>
                        <h2 className="text-lg font-semibold text-brand-pink mb-3">Artículos</h2>
                        <ul className="space-y-6">
                            {(bloom.items || []).map((it, i) => (
                                <ItemCard
                                    key={i}
                                    it={it}
                                    orderId={bloom.orderId}
                                    adminKey={adminKey}
                                    onError={setErr}
                                    onDelivered={handleItemDelivered}
                                />
                            ))}
                        </ul>
                    </div>
                </section>

                {/* Totales */}
                <aside className="space-y-6">
                    <div className="rounded-2xl border bg-white shadow-sm p-6 space-y-3">
                        <h2 className="text-lg font-semibold text-brand-pink">Totales</h2>
                        <div className="text-sm text-gray-700 space-y-2">
                            <div className="flex items-center justify-between">
                                <span>Productos</span>
                                <b>{mxn((bloom?.amounts || {}).productsSubtotal)}</b>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Envío</span>
                                <b>{mxn((bloom?.amounts || {}).shippingTotal)}</b>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Base gravable</span>
                                <b>{mxn((bloom?.amounts || {}).taxBase)}</b>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>IVA</span>
                                <b>{mxn((bloom?.amounts || {}).iva)}</b>
                            </div>
                            <div className="h-px bg-gray-200 my-2" />
                            <div className="flex items-center justify-between text-lg">
                                <span>Total</span>
                                <b>{mxn((bloom?.amounts || {}).grandTotal)}</b>
                            </div>
                        </div>
                    </div>

                    {Array.isArray(bloom.statusHistory) && bloom.statusHistory.length > 0 && (
                        <div className="rounded-2xl border bg-white shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-brand-pink mb-2">Historial de estatus</h2>
                            <ul className="text-sm text-gray-700 space-y-1">
                                {bloom.statusHistory
                                    .slice()
                                    .reverse()
                                    .map((ev, i) => (
                                        <li key={i} className="flex items-center justify-between">
                                            <span>{STATUS_LABELS[ev.status] || ev.status}</span>
                                            <span className="text-gray-500">{new Date(ev.at).toLocaleString()}</span>
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}
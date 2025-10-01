"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

/* ===== Helpers ===== */
const cn = (...xs) => xs.filter(Boolean).join(" ");

const parseYMDToLocalDate = (ymd) => {
    if (!ymd) return null;
    const [y, m, d] = ymd.split("-").map(Number);
    return new Date(y, m - 1, d); // hora local
};

const formatYMDLocal = (ymd, locale = "es-MX") => {
    const dt = parseYMDToLocalDate(ymd);
    return dt ? dt.toLocaleDateString(locale) : "—";
};

// Mapeo de status
const STATUS_BADGES = {
    PENDING_PAYMENT: {
        label: "Pendiente de pago",
        class: "bg-amber-100 text-amber-800",
    },
    PAY_COMPLETE: {
        label: "Pagado",
        class: "bg-emerald-100 text-emerald-800",
    },
};

export default function AdminItemsPage() {
    const router = useRouter();
    const API_BASE = (process.env.NEXT_PUBLIC_ORDER_API_BASE || "").replace(/\/+$/, "");

    /* ===== Auth ===== */
    const [adminKey, setAdminKey] = useState("");
    const [authOk, setAuthOk] = useState(false);

    useEffect(() => {
        const k = localStorage.getItem("admin_key") || "";
        if (k) {
            setAdminKey(k);
            setAuthOk(true);
        }
    }, []);

    function onSaveKey(e) {
        e?.preventDefault?.();
        if (!adminKey.trim()) return;
        localStorage.setItem("admin_key", adminKey.trim());
        setAuthOk(true);
    }

    function logout() {
        localStorage.removeItem("admin_key");
        setAdminKey("");
        setAuthOk(false);
        // limpiar datos visibles al salir
        setItems([]);
        setNextToken("");
        setErr("");
    }

    /* ===== Data ===== */
    const [items, setItems] = useState([]);
    const [nextToken, setNextToken] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    /* ===== Filtros ===== */
    const [fStatus, setFStatus] = useState("");
    const [fCity, setFCity] = useState("");
    const [fDeliveryDate, setFDeliveryDate] = useState("");
    const [fOrderId, setFOrderId] = useState("");

    async function fetchItemsFromApi({ token = "", append = false } = {}) {
        if (!API_BASE) {
            setErr("Falta NEXT_PUBLIC_ORDER_API_BASE");
            return;
        }
        setLoading(true);
        setErr("");
        try {
            const qs = new URLSearchParams({ limit: "100" });
            if (token) qs.set("nextToken", token);

            const res = await fetch(`${API_BASE}/orders/list?${qs.toString()}`, {
                cache: "no-store",
                headers: authOk ? { "x-admin-key": adminKey } : {},
            });

            if (res.status === 401 || res.status === 403) {
                // clave inválida o faltante → forzar logout
                logout();
                return;
            }

            if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
            const data = await res.json();
            setItems((prev) =>
                append ? [...prev, ...(data.items || [])] : data.items || []
            );
            setNextToken(data.nextToken || "");
        } catch (e) {
            setErr(String(e?.message || e));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (authOk) {
            fetchItemsFromApi();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authOk]);

    /* ===== Opciones de ciudad ===== */
    const cityOptions = useMemo(() => {
        const set = new Set(
            (items || []).map((i) => (i.city || "").toLowerCase()).filter(Boolean)
        );
        return ["", ...Array.from(set).sort()];
    }, [items]);

    /* ===== Items visibles ===== */
    const viewItems = useMemo(() => {
        return (items || []).filter((it) => {
            const byStatus = fStatus ? it.orderStatus === fStatus : true;
            const byCity = fCity
                ? String(it.city || "").toLowerCase() === fCity.toLowerCase()
                : true;
            const byDelivery = fDeliveryDate
                ? (it?.delivery?.date || it?.deliveryDate) === fDeliveryDate
                : true;
            const byOrderId = fOrderId
                ? String(it.orderId || "")
                    .toLowerCase()
                    .includes(fOrderId.trim().toLowerCase())
                : true;
            return byStatus && byCity && byDelivery && byOrderId;
        });
    }, [items, fStatus, fCity, fDeliveryDate, fOrderId]);

    /* ===== Handlers ===== */
    const clearAll = () => {
        setFStatus("");
        setFCity("");
        setFDeliveryDate("");
        setFOrderId("");
    };

    /* ===== UI: Login si no auth ===== */
    if (!authOk) {
        return (
            <div className="min-h-[100dvh] grid place-items-center bg-white">
                <form
                    onSubmit={onSaveKey}
                    className="w-full max-w-sm rounded-2xl border p-6 shadow-sm space-y-4"
                >
                    <h1 className="text-xl font-semibold">Panel de vendedor</h1>
                    <label className="block text-sm text-gray-700">
                        Clave de administración
                        <input
                            type="password"
                            value={adminKey}
                            onChange={(e) => setAdminKey(e.target.value)}
                            className="mt-1 w-full rounded-md border px-3 py-2"
                            placeholder="Ingresa tu clave"
                        />
                    </label>
                    <button
                        type="submit"
                        className="w-full rounded-full bg-pink-600 text-white px-5 py-2 text-sm font-medium hover:bg-pink-700"
                    >
                        Entrar
                    </button>
                    {err ? (
                        <div className="text-sm text-pink-600">{err}</div>
                    ) : null}
                </form>
            </div>
        );
    }

    /* ===== UI principal ===== */
    return (
        <div className="min-h-[100dvh] bg-white">
            {/* Header */}
            <header className="border-b">
                <div className="mx-auto max-w-7xl px-4 py-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-semibold tracking-tight text-gray-900">
                            Ítems de órdenes
                        </h1>
                        <span className="text-xs text-gray-500">Total: {items.length}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => fetchItemsFromApi({ token: "", append: false })}
                            disabled={loading}
                            className="inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-xs font-semibold hover:bg-gray-50 transition"
                            title="Refrescar"
                        >
                            Refrescar
                        </button>
                        <button
                            onClick={logout}
                            className="inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-xs font-semibold hover:bg-gray-50 transition"
                            title="Cambiar clave / salir"
                        >
                            Cambiar clave
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
                {/* Filtros en una sola línea */}
                <div className="rounded-2xl border p-4 shadow-sm animate-fadeIn flex flex-wrap gap-4 items-end">
                    {/* Status */}
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(STATUS_BADGES).map(([key, { label, class: cls }]) => (
                            <button
                                key={key}
                                onClick={() => setFStatus(fStatus === key ? "" : key)}
                                className={cn(
                                    "px-3 py-1 rounded-full text-xs font-medium border transition",
                                    fStatus === key
                                        ? `${cls} ring-2 ring-offset-1 ring-gray-400`
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                )}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Ciudad */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Ciudad
                        </label>
                        <select
                            value={fCity}
                            onChange={(e) => setFCity(e.target.value)}
                            className="rounded-xl border px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-brand-pink/30 capitalize"
                        >
                            {cityOptions.map((c) => (
                                <option className="capitalize" key={c} value={c}>
                                    {c ? c : "Todas"}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Fecha entrega */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Fecha entrega
                        </label>
                        <input
                            type="date"
                            value={fDeliveryDate}
                            onChange={(e) => setFDeliveryDate(e.target.value)}
                            className="rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-pink/30"
                        />
                    </div>

                    {/* Order ID */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Order ID
                        </label>
                        <input
                            type="text"
                            value={fOrderId}
                            onChange={(e) => setFOrderId(e.target.value)}
                            placeholder="ord_xxx"
                            className="rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-pink/30"
                        />
                    </div>

                    {/* Limpiar */}
                    <button
                        onClick={clearAll}
                        className="inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition"
                    >
                        Limpiar
                    </button>
                </div>

                {/* Tabla */}
                <div className="overflow-hidden rounded-2xl border shadow-sm">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50">
                        <tr className="text-left text-xs font-semibold text-gray-600">
                            <th className="px-4 py-3">Item ID</th>
                            <th className="px-4 py-3">Order ID</th>
                            <th className="px-4 py-3">Comprador</th>
                            <th className="px-4 py-3">Teléfono</th>
                            <th className="px-4 py-3">Fecha de entrega</th>
                            <th className="px-4 py-3">Ciudad</th>
                            <th className="px-4 py-3">Status</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                        {viewItems.map((it, i) => (
                            <tr
                                key={`${it.orderId}-${i}-${it?.itemId || it?.orderItemIndex || "x"}`}
                                className="hover:bg-gray-50 cursor-pointer"
                                onClick={() => router.push(`/admin/bloom/${it.orderId}`)}
                            >
                                <td className="px-4 py-3 font-mono text-xs text-gray-900">
                                    {it.itemId || "—"}
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-gray-900">
                                    {it.orderId || "—"}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                    {it?.buyer?.name || "—"}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                    {it?.buyer?.phone || "—"}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                    {formatYMDLocal(it?.delivery?.date || it?.deliveryDate)}
                                </td>
                                <td className="px-4 py-3 text-sm capitalize text-gray-700">
                                    {it.city || "—"}
                                </td>
                                <td className="px-4 py-3">
                                    {STATUS_BADGES[it.orderStatus] ? (
                                        <span
                                            className={cn(
                                                "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
                                                STATUS_BADGES[it.orderStatus].class
                                            )}
                                        >
                                                {STATUS_BADGES[it.orderStatus].label}
                                            </span>
                                    ) : (
                                        "—"
                                    )}
                                </td>
                            </tr>
                        ))}

                        {viewItems.length === 0 && !loading && (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="px-4 py-10 text-center text-sm text-gray-500"
                                >
                                    Sin resultados.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Footer actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchItemsFromApi({ token: nextToken, append: true })}
                        disabled={!nextToken || loading}
                        className={cn(
                            "inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition",
                            !nextToken || loading
                                ? "opacity-60 cursor-not-allowed"
                                : "hover:bg-gray-50"
                        )}
                    >
                        {loading ? "Cargando…" : nextToken ? "Cargar más" : "No hay más"}
                    </button>

                    <button
                        onClick={() => fetchItemsFromApi({ token: "", append: false })}
                        disabled={loading}
                        className="inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition"
                    >
                        Refrescar
                    </button>
                </div>

                {/* Errores */}
                {err ? (
                    <div className="text-sm text-pink-600">
                        {err}
                    </div>
                ) : null}
            </main>
        </div>
    );
}
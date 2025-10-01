"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/app/context/globalContext";

/* ======================== Helpers existentes ======================== */
async function getPresignPut(key, contentType) {
    const res = await fetch(process.env.NEXT_PUBLIC_PRESIGN_PUT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, contentType }),
    });
    if (!res.ok) throw new Error(`presign failed: ${res.status}`);
    return res.json(); // { url }
}

async function uploadWithPresignedPut(url, file, contentType) {
    const up = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": contentType || "application/octet-stream" },
        body: file,
    });
    if (!up.ok) throw new Error(`upload failed: ${up.status}`);
}

function money(n = 0) {
    return n.toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 0,
    });
}

const hasAnyValue = (v) => {
    if (v === null || v === undefined) return false;
    const s = String(v).trim();
    return s.length > 0;
};

function checkAddressComplete(addrRaw) {
    const addr = addrRaw?.address ? { ...addrRaw, ...addrRaw.address } : addrRaw || {};
    const street = addr.street ?? addr.calle ?? addr.line1 ?? addr.address1;
    const ext =
        addr.extNumber ??
        addr.noExt ??
        addr.numero ??
        addr.exterior ??
        addr.numExt ??
        addr.outsideNumber;
    const neigh =
        addr.neighborhood ?? addr.colonia ?? addr.barrio ?? addr.col ?? addr.settlement;
    const fields = { street, ext, neigh };
    const missing = Object.entries(fields)
        .filter(([, v]) => !hasAnyValue(v))
        .map(([k]) => k);
    return { ok: missing.length === 0, missing };
}

function uuid() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

function getFileExtension(name = "") {
    const parts = String(name).split(".");
    return parts.length > 1 ? parts.pop().toLowerCase() : "jpg";
}
function s3KeyForImage(orderId, itemId, fileName) {
    const ext = getFileExtension(fileName);
    const newFile = `${uuid()}.${ext}`;
    return `orders/${orderId}/${itemId}/${newFile}`;
}

function getRootCityLower(cartItems) {
    const city = cartItems?.[0]?.options?.city?.city || "";
    return city.toLowerCase();
}
function getIdProduct(product) {
    const raw = product?.id ?? "";
    const m = String(raw).match(/\d+/);
    return m ? Number(m[0]) : null;
}
function mapDelivery(it) {
    const mode = it?.deliveryAddress?.mode === "delivery" ? "delivery" : "pickup";
    const date = it?.options?.date || "";
    if (mode === "pickup") return { deliveryMode: "pickup", date };

    const addrRaw = it?.deliveryAddress || {};
    const addr = addrRaw?.address ? { ...addrRaw, ...addrRaw.address } : addrRaw;
    const street = addr.street ?? addr.calle ?? addr.line1 ?? addr.address1 ?? "";
    const number =
        addr.extNumber ??
        addr.noExt ??
        addr.numero ??
        addr.exterior ??
        addr.numExt ??
        addr.outsideNumber ??
        "";
    const town =
        addr.neighborhood ?? addr.colonia ?? addr.barrio ?? addr.col ?? addr.settlement ?? "";
    const cp = it?.shipping?.cp || addr.cp || addr.postalCode || addr.zip || "";
    return {
        deliveryMode: "delivery",
        name: addrRaw.fullName || "",
        phone: addrRaw.phone || "",
        address: { cp, street, number, town },
        date,
    };
}

/** Construye payload final para crear orden */
function buildOrderPayload(cart, orderId) {
    const items = cart?.cartItems || [];

    const cartItems = items.map((it) => {
        const itemId = uuid();

        const images = (it.images || []).map((img) => ({
            id: img.id,
            originalName: img.name,
            size: img.size,
            type: img.type,
            s3Key: s3KeyForImage(orderId, itemId, img.name),
        }));

        const p = it?.product || {};
        const product = {
            id: p.id || null,
            name: p.name || "",
            subtitle: p.subtitle || "",
        };

        return {
            itemId,
            idBouquet: it?.productSlug || it?.id || "",
            message: { title: it?.options?.title || "", message: it?.options?.message || "" },
            idProduct: getIdProduct(p),
            product,
            delivery: mapDelivery(it),
            images,
        };
    });

    return {
        orderId,
        cartItems,
        buyer: {
            name: [cart?.buyer?.firstName, cart?.buyer?.lastName].filter(Boolean).join(" "),
            phone: cart?.buyer?.phone || "",
            email: cart?.buyer?.email || "",
        },
        city: getRootCityLower(items),
    };
}

/* ======================== UI Component ======================== */
export default function CostSummary({
                                        onSubmit,
                                        submitLabel = "Crear orden",
                                        disabled = false,
                                        loading = false,
                                    }) {
    const router = useRouter();
    const {
        state: { cart },
    } = useGlobalContext();

    const [submitting, setSubmitting] = useState(false);
    const [phase, setPhase] = useState("Preparando…");

    const {
        productSubtotal,
        shippingTotal,
        total,
        pendingShippingLineIds,
        missingAddressLineIds,
        lines,
        isCartEmpty,
    } = useMemo(() => {
        const lines = [];
        let productSubtotal = 0;
        let shippingTotal = 0;
        const pendingShippingLineIds = [];
        const missingAddressLineIds = [];
        const items = cart.cartItems || [];

        for (const it of items) {
            const qty = Number(it.quantity || 1);
            const lineProducts = (it.price || 0) * qty;
            productSubtotal += lineProducts;

            let lineShipping = 0;
            const isDelivery = it?.deliveryAddress?.mode === "delivery";
            if (isDelivery) {
                const { ok: addrOk } = checkAddressComplete(it?.deliveryAddress);
                if (!addrOk) missingAddressLineIds.push(it.lineId);

                if (it?.shipping?.valid) {
                    const unitShipping = Number(it.shipping.cost || 0);
                    lineShipping = unitShipping * qty;
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

        const total = productSubtotal + shippingTotal;

        return {
            productSubtotal,
            shippingTotal,
            total,
            pendingShippingLineIds,
            missingAddressLineIds,
            lines,
            isCartEmpty: items.length === 0,
        };
    }, [cart.cartItems]);

    const buyer = cart?.buyer || {};
    const fullNameOk = Boolean((buyer.firstName || "").trim());
    const phoneOk = !!buyer.phone && buyer.phone.replace(/\D/g, "").length === 10;
    const emailOk = !!buyer.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyer.email.trim());

    const hasPendingShipping = pendingShippingLineIds.length > 0;
    const hasMissingAddress = missingAddressLineIds.length > 0;

    const blockingIssues = [];
    if (isCartEmpty) blockingIssues.push("Tu carrito está vacío.");
    if (!fullNameOk) blockingIssues.push("Falta el nombre del comprador.");
    if (!phoneOk) blockingIssues.push("El teléfono debe tener 10 dígitos (MX).");
    if (!emailOk) blockingIssues.push("Ingresa un correo válido.");
    if (hasMissingAddress) blockingIssues.push("Falta dirección completa en artículos con envío a domicilio.");
    if (hasPendingShipping) blockingIssues.push("Hay artículos con envío pendiente por C.P.");
    if (disabled) blockingIssues.push("Acción deshabilitada.");
    if (loading) blockingIssues.push("Procesando…");

    const allValid = blockingIssues.length === 0;

    const handleCreateOrder = async () => {
        setSubmitting(true);
        setPhase("Preparando orden…");

        try {
            const localOrderId = uuid();
            const payload = buildOrderPayload(cart, localOrderId);

            const filesToUpload = [];
            (cart.cartItems || []).forEach((cartIt, i) => {
                const pItem = payload.cartItems[i];
                (cartIt.images || []).forEach((img, j) => {
                    const meta = pItem.images[j];
                    if (meta?.s3Key && img?.file) {
                        filesToUpload.push({
                            key: meta.s3Key,
                            file: img.file,
                            contentType: img.type || "application/octet-stream",
                        });
                    }
                });
            });

            for (let idx = 0; idx < filesToUpload.length; idx++) {
                const f = filesToUpload[idx];
                setPhase(`Subiendo imágenes… (${idx + 1}/${filesToUpload.length})`);
                const { url } = await getPresignPut(f.key, f.contentType);
                await uploadWithPresignedPut(url, f.file, f.contentType);
            }

            setPhase("Creando orden…");
            const res = await fetch(process.env.NEXT_PUBLIC_CREATE_ORDER_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error(`Order API failed: ${res.status}`);
            const data = await res.json();

            const orderIdFromResp =
                data?.orderId || data?.session?.metadata?.orderId || localOrderId;

            try {
                onSubmit?.(payload, { orderId: orderIdFromResp, apiResponse: data });
            } catch {}

            setPhase("Redirigiendo…");
            router.push(`/success?orderId=${encodeURIComponent(orderIdFromResp)}`);
        } catch (err) {
            console.error(err);
            alert("Error subiendo imágenes o creando la orden.");
            setSubmitting(false);
        }
    };

    return (
        <>
            {submitting && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-white/70 backdrop-blur-sm animate-fadeIn">
                    <div className="rounded-2xl border bg-white shadow-lg px-6 py-5 w-[min(90vw,420px)] text-center">
                        <div className="mx-auto mb-3 h-10 w-10 rounded-full border-4 border-brand-pink border-t-transparent animate-spin" />
                        <h3 className="text-base font-semibold text-gray-900">Procesando tu orden…</h3>
                        <p className="text-sm text-gray-600 mt-1">{phase}</p>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <ul className="divide-y divide-gray-100">
                    {lines.map((ln) => (
                        <li key={ln.lineId} className="py-3">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {ln.name}
                                        {ln.qty > 1 && <span className="ml-1 text-gray-500 font-normal">× {ln.qty}</span>}
                                    </p>

                                    <p className="text-xs text-gray-500">Productos: {money(ln.lineProducts)}</p>

                                    {ln.isDelivery ? (
                                        ln.shipping?.valid ? (
                                            <p className="text-xs text-emerald-700">Envío: {money(ln.lineShipping)}</p>
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

                    <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-base font-semibold text-gray-900">Total</span>
                        <span className="text-base font-semibold text-gray-900 tabular-nums">
              {money(total)}
            </span>
                    </div>
                </div>

                {!allValid && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 space-y-1">
                        {blockingIssues.map((msg, i) => (
                            <div key={i}>• {msg}</div>
                        ))}
                    </div>
                )}

                {allValid && (
                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={handleCreateOrder}
                            data-testid="checkout-button"
                            disabled={submitting || disabled || loading}
                            className="w-full inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold bg-brand-pink text-white hover:opacity-90 disabled:opacity-60 transition"
                            title={submitLabel}
                        >
                            {submitting ? "Procesando..." : loading ? "Procesando..." : submitLabel}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
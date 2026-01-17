"use client";

import { useGlobalContext } from "@/app/context/globalContext";

const digitsOnly = (s = "") => String(s).replace(/\D/g, "");

function isValidStoredPhone(phone) {
    const d = digitsOnly(phone);

    // MX: 52 + 10 dígitos
    if (d.startsWith("52")) return d.length === 12;

    // US/CA: 1 + 10 dígitos
    if (d.startsWith("1")) return d.length === 11;

    // legacy (si aún tienes datos viejos sin country code)
    if (d.length === 10) return true;

    // fallback razonable
    return d.length >= 8 && d.length <= 15;
}

function validateBuyer(buyer) {
    const { firstName, lastName, phone, email } = buyer || {};
    const phoneOk = phone && isValidStoredPhone(phone);
    const emailOk = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    return Boolean(firstName && lastName && phoneOk && emailOk);
}

function validateCart(cartItems) {
    if (!cartItems?.length) return false;

    for (const it of cartItems) {
        if (it?.deliveryAddress?.mode === "delivery") {
            const addr = it.deliveryAddress || {};

            const phoneOk = addr.phone && isValidStoredPhone(addr.phone);
            const cpOk = addr.cp && /^\d{5}$/.test(addr.cp);
            const hasFields = addr.fullName && addr.street && addr.neighborhood;
            const shippingOk = it.shipping?.valid;

            if (!(cpOk && phoneOk && hasFields && shippingOk)) return false;
        }
    }
    return true;
}

export default function PayButton() {
    const {
        state: { cart },
    } = useGlobalContext();

    const buyerOk = validateBuyer(cart?.buyer);
    const cartOk = validateCart(cart?.cartItems);
    const isValid = buyerOk && cartOk;

    return (
        <button
            type="button"
            disabled={!isValid}
            className={`w-full rounded-lg px-4 py-3 text-sm font-semibold shadow ${
                isValid ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            onClick={() => {
                if (!isValid) return;
                alert("¡Procesando pago! 🚀");
                // aquí lanzas tu flujo real de pago
            }}
        >
            {isValid ? "Pagar ahora" : "Completa la información para pagar"}
        </button>
    );
}
// utils/cartFormat.js
export function formatVal(v) {
    if (v == null) return "";
    if (typeof v === "string" || typeof v === "number") return String(v);
    if (typeof v === "object") {
        if ("city" in v || "pickup" in v) {
            const parts = [v.city, v.pickup].filter(Boolean);
            return parts.join(" · ");
        }
        return JSON.stringify(v);
    }
    return String(v);
}
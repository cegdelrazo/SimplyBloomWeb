// utils/shipping.js
export function simulateShippingByCP(cp) {
    if (!/^\d{5}$/.test(cp)) {
        return { valid: false, message: "Ingresa un CP válido de 5 dígitos." };
    }
    const n = Number(cp);

    // Simulados: ajusta a tus reglas reales cuando las tengas
    if (n >= 1000 && n <= 16999) {
        return { valid: true, zone: "CDMX", etaDays: "", cost: 89, note: "" };
    }
    if (n >= 44000 && n <= 44999) {
        return { valid: true, zone: "Guadalajara", etaDays: "", cost: 129, note: "" };
    }
    if (n >= 64000 && n <= 67999) {
        return { valid: true, zone: "Monterrey", etaDays: "24–48h", cost: 129, note: "Cobertura metropolitana." };
    }
    return { valid: true, zone: "Nacional", etaDays: "2–4 días", cost: 189, note: "Zonas extendidas pueden tardar más." };
}
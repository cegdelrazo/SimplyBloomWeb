// utils/shipping.js
import zones from "@/app/data/shippingZones"; // <-- sin .json, importa el .js

function cpToNumber(cp) { return Number(cp); }

function findZoneByCp(cp) {
    const n = cpToNumber(cp);
    if (Number.isNaN(n)) return null;

    for (const z of zones) {
        if (Array.isArray(z.includes) && z.includes.includes(n)) return z;
    }
    for (const z of zones) {
        if (typeof z.min === "number" && typeof z.max === "number") {
            if (n >= z.min && n <= z.max) return z;
        }
    }
    return null;
}

function etaForCity(city) {
    switch (city) {
        case "Monterrey":
        case "San Pedro Garza García":
            return "24–48h";
        case "CDMX":
            return "";
        case "Guadalajara":
        case "Zapopan":
        case "Tlaquepaque":
        case "Tonalá":
        case "Tlajomulco de Zúñiga":
            return "24–48h";
        default:
            return "";
    }
}

export function simulateShippingByCP(cp) {
    if (!/^\d{5}$/.test(cp)) {
        return { valid: false, message: "Ingresa un CP válido de 5 dígitos." };
    }
    const match = findZoneByCp(cp);
    if (match) {
        return {
            valid: true,
            id: match.id,
            city: match.city,
            zone: match.label,
            cost: match.price,
            etaDays: etaForCity(match.city),
            note: "",
        };
    }
    return {
        valid: true,
        id: "nacional",
        city: "Nacional",
        zone: "Cobertura nacional",
        cost: 189,
        etaDays: "2–4 días",
        note: "Zonas extendidas pueden tardar más.",
    };
}
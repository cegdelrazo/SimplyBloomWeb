// constants.js (o el archivo donde definiste estos exports)
import * as Yup from "yup";

export const RAMOS = [
    { key: "rose", name: "RAMO ROSE", price: 800, img: "/media/bouquets/rose.webp" },
    { key: "lino", name: "RAMO LINO", price: 800, img: "/media/bouquets/lino.webp" },
];

export const cities = [
    {
        city: "CDMX",
        pickup: "Calle Sócrates en Polanco",
        blockedDates: ["2025-10-11", "2025-10-18", "2025-10-25", "2025-12-25", "2025-12-26", "2025-12-27", "2025-12-28", "2025-12-29", "2025-12-30", "2025-12-31", "2026-01-01", "2026-01-02", "2026-01-03", "2026-01-04",],
    }
];

export const HOLIDAYS = [
    "2025-01-01","2025-02-03","2025-03-17","2025-05-01","2025-09-16","2025-11-17",
];

// Helper opcional (por si lo quieres usar en otros lados)
export function isBlockedForCity(selectedCityObj, dateStr) {
    if (!selectedCityObj || !dateStr) return false;
    const arr = Array.isArray(selectedCityObj.blockedDates) ? selectedCityObj.blockedDates : [];
    return arr.includes(dateStr);
}

// ⬇️ Schema que valida por ciudad seleccionada
export const buildOrderSchema = (tomorrow, holidays = HOLIDAYS) =>
    Yup.object().shape({
        city: Yup.object({
            city: Yup.string().required(),
            pickup: Yup.string().required(),
            blockedDates: Yup.array().of(Yup.string()).optional(), // 👈 soporta bloqueos por ciudad
        })
            .required("Selecciona una ciudad")
            .typeError("Selecciona una ciudad"),

        date: Yup.string()
            .required("Elige una fecha")
            .test("from-tomorrow", "Solo a partir de mañana", (v) => !!v && v >= tomorrow)
            .test("not-holiday", "No hay entregas en días festivos", (v) => !!v && !holidays.includes(v))
            .test("not-sunday", "No hay entregas los domingos", (v) => {
                if (!v) return false;
                const d = new Date(v + "T00:00:00");
                return d.getDay() !== 0;
            })
            .test("not-blocked-by-city", "No hay entregas ese día en la ciudad seleccionada", function (v) {
                if (!v) return false;
                const selectedCityObj = this?.parent?.city || null;
                const blocked = Array.isArray(selectedCityObj?.blockedDates) ? selectedCityObj.blockedDates : [];
                return !blocked.includes(v);
            }),

        title: Yup.string().max(60, "Máximo 60 caracteres"),
        message: Yup.string().max(240, "Máximo 240 caracteres"),
    });
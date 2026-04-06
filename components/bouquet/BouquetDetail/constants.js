// constants.js (o el archivo donde definiste estos exports)
import * as Yup from "yup";

export const RAMOS = [
    { key: "chetos", name: "RAMO DE PAPAS", price: 800, img: "/media/bouquets/papas.webp" },
    { key: "rose", name: "RAMO ROSE", price: 800, img: "/media/bouquets/rose.webp" },
    { key: "lino", name: "RAMO LINO", price: 800, img: "/media/bouquets/lino.webp" },
];

export const cities = [
    {
        city: "CDMX",
        pickup: "Calle Sócrates en Polanco",
        blockedDates: ["2026-04-02", "2026-04-03", "2026-04-04", "2026-04-09", "2026-04-10"],
    }
];

export const HOLIDAYS = [
    "2026-03-16", "2026-03-26"
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

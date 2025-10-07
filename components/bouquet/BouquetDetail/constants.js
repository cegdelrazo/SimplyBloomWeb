import * as Yup from "yup";

export const RAMOS = [
    { key: "rose", name: "RAMO ROSE", price: 800, img: "/media/bouquets/rose.webp" },
    { key: "lino",  name: "RAMO LINO",  price: 900, img: "/media/bouquets/lino.webp" },
];

export const cities = [
    { city: "CDMX",        pickup: "Calle Sócrates en Polanco" },
    { city: "Guadalajara", pickup: "Colonia Lomas del Valle" },
    { city: "Monterrey",   pickup: "Dr. Roberto J. Cantú" },
];

export const HOLIDAYS = [
    "2025-01-01","2025-02-03","2025-03-17","2025-05-01","2025-09-16","2025-11-17","2025-12-25",
];

const BLOCKED_DATES = ["2025-10-11", "2025-10-18", "2025-10-25"];

// ⬇️ ahora el schema exige fecha > hoy (es decir, desde mañana)
export const buildOrderSchema = (tomorrow, holidays = HOLIDAYS) =>
    Yup.object().shape({
        city: Yup.object({
            city:   Yup.string().required(),
            pickup: Yup.string().required(),
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
            .test("not-blocked-dates", "No hay entregas ese día", (v) => !!v && !BLOCKED_DATES.includes(v)),

        title:   Yup.string().max(60, "Máximo 60 caracteres"),
        message: Yup.string().max(240, "Máximo 240 caracteres"),
    });
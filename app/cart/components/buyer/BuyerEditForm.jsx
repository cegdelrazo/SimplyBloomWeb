"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const COUNTRY_OPTIONS = [
    { value: "52", label: "🇲🇽 +52", nationalLength: 10, placeholder: "5512345678" },
    { value: "1", label: "🇺🇸🇨🇦 +1", nationalLength: 10, placeholder: "4155552671" },
];

const digitsOnly = (s = "") => String(s).replace(/\D/g, "");

function inferCountryAndNationalFromStoredPhone(stored) {
    // stored = "525512345678" o "+525512345678" o "00525512345678" o "5512345678"
    const d0 = digitsOnly(stored);
    let d = d0;

    // quitar 00 si existe
    if (d.startsWith("00")) d = d.slice(2);

    // Si viene con 52 + 10
    if (d.startsWith("52") && d.length >= 12) {
        return { countryCode: "52", national: d.slice(-10) };
    }

    // Si viene con 1 + 10
    if (d.startsWith("1") && d.length >= 11) {
        return { countryCode: "1", national: d.slice(-10) };
    }

    // Si parece MX nacional (10)
    if (d.length === 10) {
        return { countryCode: "52", national: d };
    }

    // fallback
    return { countryCode: "52", national: d.slice(-10) };
}

function normalizeNationalPhone(raw, countryCode) {
    const cc = digitsOnly(countryCode);
    let d = digitsOnly(raw);

    // quitar 00
    if (d.startsWith("00")) d = d.slice(2);

    // quitar +cc si viene pegado
    if (cc && d.startsWith(cc)) d = d.slice(cc.length);

    // MX: quedarse con últimos 10
    if (cc === "52") {
        if (d.length > 10) d = d.slice(-10);
        return d.slice(0, 10);
    }

    // US/CA básico: 10
    if (cc === "1") {
        if (d.length > 10) d = d.slice(-10);
        return d.slice(0, 10);
    }

    // otros: hasta 15
    return d.slice(0, 15);
}

function formatE164Lite(countryCode, national) {
    const cc = digitsOnly(countryCode);
    const n = digitsOnly(national);
    return `${cc}${n}`; // SIN "+" porque tu backend hoy guarda así (ej. 5255...)
}

const BuyerSchema = Yup.object({
    fullName: Yup.string().trim().required("Requerido"),
    phone: Yup.string()
        .required("Requerido")
        .test("phone-by-cc", "Teléfono inválido", (v) => {
            if (!v) return false;
            const d = digitsOnly(v);

            // MX: 52 + 10 = 12
            if (d.startsWith("52")) return d.length === 12;

            // US/CA: 1 + 10 = 11
            if (d.startsWith("1")) return d.length === 11;

            // fallback razonable
            return d.length >= 8 && d.length <= 15;
        }),
    email: Yup.string().trim().email("Correo inválido").required("Requerido"),
});

function Label({ children }) {
    return <label className="text-[11px] text-gray-600">{children}</label>;
}
function Error({ name }) {
    return <ErrorMessage name={name} component="div" className="mt-1 text-[11px] text-red-600" />;
}

export default function BuyerEditForm({ initialValues, isFirstTime = false, onSaved, onCancel }) {
    const safeInitialValues = useMemo(
        () => ({
            fullName: "",
            phone: "",
            email: "",
            ...initialValues,
        }),
        [initialValues]
    );

    const [countryCode, setCountryCode] = useState("52");
    const [phoneNational, setPhoneNational] = useState("");

    // Rehidrata UI desde initialValues.phone (sin cambiar backend)
    useEffect(() => {
        const { countryCode: cc, national } = inferCountryAndNationalFromStoredPhone(safeInitialValues.phone);
        setCountryCode(cc);
        setPhoneNational(normalizeNationalPhone(national, cc));
    }, [safeInitialValues.phone]);

    const selectedCountry = COUNTRY_OPTIONS.find((c) => c.value === countryCode) ?? COUNTRY_OPTIONS[0];

    return (
        <Formik
            initialValues={safeInitialValues}
            validationSchema={BuyerSchema}
            enableReinitialize
            validateOnBlur
            validateOnChange
            onSubmit={(values, { setSubmitting }) => {
                // values.phone ya viene concatenado (cc + national)
                onSaved?.(values);
                setSubmitting(false);
            }}
        >
            {({ setFieldValue, isSubmitting, isValid, values }) => {
                // Mantener sincronizado el value real que va al backend
                useEffect(() => {
                    const full = formatE164Lite(countryCode, phoneNational);
                    if (digitsOnly(values.phone) !== digitsOnly(full)) {
                        setFieldValue("phone", full, false); // no spamear validación en cada render
                    }
                    // eslint-disable-next-line react-hooks/exhaustive-deps
                }, [countryCode, phoneNational]);

                const handleCountryChange = (e) => {
                    const cc = e.target.value;
                    setCountryCode(cc);

                    // re-normaliza por si cambia regla (ej. MX últimos 10)
                    const normalized = normalizeNationalPhone(phoneNational, cc);
                    setPhoneNational(normalized);

                    // setFieldValue ocurre en el useEffect sincronizador
                };

                const handlePhoneChange = (e) => {
                    const normalized = normalizeNationalPhone(e.target.value, countryCode);
                    setPhoneNational(normalized);
                    // setFieldValue ocurre en el useEffect sincronizador
                };

                const handlePhonePaste = (e) => {
                    const text = e.clipboardData?.getData("text") ?? "";
                    const d = digitsOnly(text);

                    // inferir país por prefijo si viene pegado
                    let inferred = null;
                    let x = d;
                    if (x.startsWith("00")) x = x.slice(2);

                    if (x.startsWith("52")) inferred = "52";
                    else if (x.startsWith("1")) inferred = "1";

                    const cc = inferred ?? countryCode;
                    if (inferred) setCountryCode(inferred);

                    const normalized = normalizeNationalPhone(text, cc);
                    setPhoneNational(normalized);

                    e.preventDefault();
                };

                const hint =
                    countryCode === "52"
                        ? "MX: escribe 10 dígitos (sin 52). Si pegas 52…, lo arreglamos."
                        : countryCode === "1"
                            ? "US/CA: 10 dígitos."
                            : "Teléfono (6 a 15 dígitos).";

                return (
                    <Form className="space-y-3">
                        {/* Nombre y Apellido */}
                        <div>
                            <Label>Nombre y Apellido</Label>
                            <Field
                                name="fullName"
                                as="input"
                                className="mt-1 w-full rounded-lg border px-3 py-2"
                                placeholder="Ej. Ana Gómez"
                            />
                            <Error name="fullName" />
                        </div>

                        {/* Teléfono con combo, pero se guarda en values.phone concatenado */}
                        <div>
                            <Label>Teléfono</Label>

                            <div className="mt-1 flex gap-2">
                                <select
                                    value={countryCode}
                                    onChange={handleCountryChange}
                                    className="w-[140px] rounded-lg border px-3 py-2 bg-white"
                                >
                                    {COUNTRY_OPTIONS.map((c) => (
                                        <option key={c.value} value={c.value}>
                                            {c.label}
                                        </option>
                                    ))}
                                </select>

                                <input
                                    type="tel"
                                    inputMode="tel"
                                    value={phoneNational}
                                    onChange={handlePhoneChange}
                                    onPaste={handlePhonePaste}
                                    className="flex-1 rounded-lg border px-3 py-2"
                                    placeholder={selectedCountry.placeholder}
                                />
                            </div>


                            {/* Campo real (backend) - oculto */}
                            <Field name="phone" type="hidden" />

                            <Error name="phone" />

                        </div>

                        {/* Email */}
                        <div>
                            <Label>Correo</Label>
                            <Field
                                name="email"
                                as="input"
                                type="email"
                                autoComplete="email"
                                className="mt-1 w-full rounded-lg border px-3 py-2"
                                placeholder="correo@ejemplo.com"
                            />
                            <Error name="email" />
                        </div>

                        {/* Actions */}
                        <div className="pt-1 flex items-center justify-end gap-2">
                            {!isFirstTime && (
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="rounded-lg border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={isSubmitting || !isValid}
                                className={`rounded-lg px-4 py-2 text-sm text-white ${
                                    isSubmitting || !isValid ? "bg-gray-300 cursor-not-allowed" : "bg-gray-900 hover:bg-black"
                                }`}
                            >
                                Guardar datos
                            </button>
                        </div>
                    </Form>
                );
            }}
        </Formik>
    );
}
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

// ================= Phone helpers =================
const COUNTRY_OPTIONS = [
    { value: "52", label: "🇲🇽 +52", nationalLength: 10, placeholder: "5512345678" },
    { value: "1", label: "🇺🇸🇨🇦 +1", nationalLength: 10, placeholder: "4155552671" },
];

const digitsOnly = (s = "") => String(s).replace(/\D/g, "");

// ================= Ext/Int helpers =================
const INT_TOKEN = " Int ";

function parseExtNumber(stored = "") {
    const s = String(stored || "").trim();
    if (!s) return { exterior: "", interior: "" };

    const idx = s.indexOf(INT_TOKEN);
    if (idx === -1) return { exterior: s, interior: "" };

    return {
        exterior: s.slice(0, idx).trim(),
        interior: s.slice(idx + INT_TOKEN.length).trim(),
    };
}

function buildExtNumber(exterior = "", interior = "") {
    const ext = String(exterior || "").trim();
    const inte = String(interior || "").trim();
    if (!ext && !inte) return "";
    if (ext && !inte) return ext;
    if (!ext && inte) return `Int ${inte}`;
    return `${ext}${INT_TOKEN}${inte}`;
}

// ================= Phone helpers =================
function inferCountryAndNationalFromStoredPhone(stored) {
    const d0 = digitsOnly(stored);
    let d = d0;

    if (d.startsWith("00")) d = d.slice(2);

    if (d.startsWith("52") && d.length >= 12) return { countryCode: "52", national: d.slice(-10) };
    if (d.startsWith("1") && d.length >= 11) return { countryCode: "1", national: d.slice(-10) };
    if (d.length === 10) return { countryCode: "52", national: d };

    return { countryCode: "52", national: d.slice(-10) };
}

function normalizeNationalPhone(raw, countryCode) {
    const cc = digitsOnly(countryCode);
    let d = digitsOnly(raw);

    if (d.startsWith("00")) d = d.slice(2);
    if (cc && d.startsWith(cc)) d = d.slice(cc.length);

    if (cc === "52" || cc === "1") {
        if (d.length > 10) d = d.slice(-10);
        return d.slice(0, 10);
    }

    return d.slice(0, 15);
}

function formatPhoneForBackend(countryCode, national) {
    return `${digitsOnly(countryCode)}${digitsOnly(national)}`; // SIN "+"
}

// ================= Validación =================
const AddressSchema = Yup.object({
    fullName: Yup.string().trim().required("Requerido"),
    phone: Yup.string()
        .required("Requerido")
        .test("phone-by-cc", "Teléfono inválido", (v) => {
            if (!v) return false;
            const d = digitsOnly(v);
            if (d.startsWith("52")) return d.length === 12;
            if (d.startsWith("1")) return d.length === 11;
            return d.length >= 8 && d.length <= 15;
        }),
    cp: Yup.string().required("Requerido").matches(/^\d{5}$/, "Debe tener 5 dígitos"),
    street: Yup.string().trim().required("Requerido"),
    extNumber: Yup.string().trim().max(40, "Muy largo"),
    neighborhood: Yup.string().trim().required("Requerido"),
});

// ================= UI atoms =================
function SectionTitle({ title, subtitle }) {
    return (
        <div className="md:col-span-12 flex items-baseline justify-between">
            <div className="flex items-center gap-2">
        <span className="inline-flex h-6 items-center rounded-full bg-gray-100 px-2 text-[11px] font-semibold text-gray-800">
          {title}
        </span>
                {subtitle ? <span className="text-[12px] text-gray-500">{subtitle}</span> : null}
            </div>
        </div>
    );
}

function Label({ htmlFor, children, hint }) {
    return (
        <label htmlFor={htmlFor} className="block text-[12px] font-medium text-gray-800">
            {children}
            {hint ? <span className="ml-1 font-normal text-gray-500">{hint}</span> : null}
        </label>
    );
}

function Help({ children }) {
    return <p className="mt-1 text-[11px] text-gray-500">{children}</p>;
}

function Error({ name }) {
    return <ErrorMessage name={name} component="div" className="mt-1 text-[11px] text-red-600" />;
}

function cx(...classes) {
    return classes.filter(Boolean).join(" ");
}

function inputBase(disabled) {
    return cx(
        "mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none transition",
        "border-gray-300 bg-white",
        "focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10",
        disabled ? "bg-gray-50 text-gray-500 cursor-not-allowed" : "hover:border-gray-400"
    );
}

function inputError(disabled) {
    return cx(
        inputBase(disabled),
        "border-red-300 focus:border-red-600 focus:ring-red-600/10"
    );
}

// Debounce util
const debounce = (fn, ms = 300) => {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), ms);
    };
};

function InnerForm({
                       initialValues,
                       values,
                       errors,
                       touched,
                       setFieldValue,
                       handleBlur,
                       isSubmitting,
                       isValid,
                       onCancel,
                       isFirstTime,
                       notifyParent,
                       onCpChange,
                       shipping,
                       markSaveIntent,
                   }) {
    const cpValid = /^\d{5}$/.test(values.cp);

    // ======== Phone UI state ========
    const [countryCode, setCountryCode] = useState("52");
    const [phoneNational, setPhoneNational] = useState("");

    // ======== Ext/Int UI state ========
    const [extExterior, setExtExterior] = useState("");
    const [extInterior, setExtInterior] = useState("");

    useEffect(() => {
        const { countryCode: cc, national } = inferCountryAndNationalFromStoredPhone(initialValues?.phone);
        setCountryCode(cc);
        setPhoneNational(normalizeNationalPhone(national, cc));

        const { exterior, interior } = parseExtNumber(initialValues?.extNumber);
        setExtExterior(exterior);
        setExtInterior(interior);
    }, [initialValues?.phone, initialValues?.extNumber]);

    useEffect(() => {
        const full = formatPhoneForBackend(countryCode, phoneNational);
        if (digitsOnly(values.phone) !== digitsOnly(full)) {
            setFieldValue("phone", full, false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [countryCode, phoneNational]);

    useEffect(() => {
        const combined = buildExtNumber(extExterior, extInterior);
        if ((values.extNumber || "") !== combined) {
            setFieldValue("extNumber", combined, false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [extExterior, extInterior]);

    const setPartialSilent = (field, transform) => (e) => {
        const raw = e.target.value;
        const v = transform ? transform(raw) : raw;
        setFieldValue(field, v, true);
    };

    const notifyFieldOnBlur = (field) => (e) => {
        handleBlur(e);
        if (notifyParent) notifyParent({ ...values, [field]: values[field] });
    };

    const handleCp = (e) => {
        const v = e.target.value.replace(/\D/g, "").slice(0, 5);
        setFieldValue("cp", v, true);
        onCpChange?.(v);
        if (notifyParent) notifyParent({ ...values, cp: v });
    };

    const selectedCountry = COUNTRY_OPTIONS.find((c) => c.value === countryCode) ?? COUNTRY_OPTIONS[0];

    const handleCountryChange = (e) => {
        const cc = e.target.value;
        setCountryCode(cc);
        setPhoneNational((prev) => normalizeNationalPhone(prev, cc));
    };

    const handlePhoneChange = (e) => setPhoneNational(normalizeNationalPhone(e.target.value, countryCode));

    const handlePhonePaste = (e) => {
        const text = e.clipboardData?.getData("text") ?? "";
        let d = digitsOnly(text);
        if (d.startsWith("00")) d = d.slice(2);

        let inferred = null;
        if (d.startsWith("52")) inferred = "52";
        else if (d.startsWith("1")) inferred = "1";

        const cc = inferred ?? countryCode;
        if (inferred) setCountryCode(inferred);

        setPhoneNational(normalizeNationalPhone(text, cc));
        e.preventDefault();
    };

    const notifyPhoneOnBlur = (e) => {
        handleBlur(e);
        if (notifyParent) notifyParent({ ...values, phone: values.phone });
    };

    const sanitizeExt = (s) => String(s || "").replace(/[^\w\-\/\. ]/g, "").slice(0, 12);
    const sanitizeInt = (s) => String(s || "").replace(/[^\w\-\/\. ]/g, "").slice(0, 12);

    const notifyExtNumberOnBlur = (e) => {
        handleBlur(e);
        if (notifyParent) notifyParent({ ...values, extNumber: values.extNumber });
    };

    const phoneHasError = Boolean(touched.phone && errors.phone);
    const cpHasError = Boolean(touched.cp && errors.cp);
    const nameHasError = Boolean(touched.fullName && errors.fullName);
    const streetHasError = Boolean(touched.street && errors.street);
    const neighHasError = Boolean(touched.neighborhood && errors.neighborhood);

    return (
        <Form className="grid grid-cols-1 md:grid-cols-12 gap-4" noValidate>
            <SectionTitle title="Contacto" subtitle="Datos de la persona que recibirá" />

            <div className="md:col-span-7">
                <Label htmlFor="fullName">Quién recibe</Label>
                <Field
                    id="fullName"
                    name="fullName"
                    as="input"
                    className={nameHasError ? inputError(false) : inputBase(false)}
                    placeholder="Nombre y apellido"
                    onChange={setPartialSilent("fullName")}
                    onBlur={notifyFieldOnBlur("fullName")}
                />
                <Error name="fullName" />
            </div>

            <div className="md:col-span-5">
                <Label htmlFor="phone">Teléfono</Label>

                <div className="mt-1 flex flex-col gap-2 md:flex-row md:items-center">
                    <select
                        value={countryCode}
                        onChange={handleCountryChange}
                        className={inputBase(false) + " md:w-[128px]"}
                        aria-label="Código de país"
                    >
                        {COUNTRY_OPTIONS.map((c) => (
                            <option key={c.value} value={c.value}>
                                {c.label}
                            </option>
                        ))}
                    </select>

                    <input
                        id="phone"
                        type="tel"
                        inputMode="tel"
                        value={phoneNational}
                        className={cx(phoneHasError ? inputError(false) : inputBase(false), "min-w-0 flex-1")}
                        placeholder={selectedCountry.placeholder}
                        onChange={handlePhoneChange}
                        onPaste={handlePhonePaste}
                        onBlur={notifyPhoneOnBlur}
                    />
                </div>

                <Help>Ingresa solo los 10 dígitos. Si pegas +52 o 52, se ajusta solo.</Help>

                <Field name="phone" type="hidden" />
                <Error name="phone" />
            </div>

            <div className="md:col-span-12 border-t border-gray-200 pt-1" />

            <SectionTitle title="Ubicación" subtitle="Necesario para calcular el envío" />

            <div className="md:col-span-4">
                <Label htmlFor="cp">Código Postal</Label>
                <Field
                    id="cp"
                    name="cp"
                    as="input"
                    type="text"
                    inputMode="numeric"
                    maxLength={5}
                    className={cpHasError ? inputError(false) : inputBase(false)}
                    placeholder="11560"
                    onChange={handleCp}
                    onBlur={notifyFieldOnBlur("cp")}
                />
                <Error name="cp" />

                <div className="mt-2 text-[12px]">
                    {values.cp?.length === 5 ? (
                        shipping?.valid ? (
                            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                                <div className="text-[12px] font-semibold">Envío</div>
                                <div className="text-sm font-bold">${shipping.cost}</div>
                            </div>
                        ) : (
                            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
                                <div className="text-[12px] font-semibold">Envío no disponible</div>
                                <div className="text-[12px]">{shipping?.note || "Ingresa un CP válido."}</div>
                            </div>
                        )
                    ) : (
                        <p className="text-gray-500">Se calcula al ingresar el C.P.</p>
                    )}
                </div>
            </div>

            <div className="md:col-span-12 border-t border-gray-200 pt-1" />

            <SectionTitle title="Dirección" subtitle="Datos para la entrega" />

            <div className="md:col-span-7">
                <Label htmlFor="street">Calle</Label>
                <Field
                    id="street"
                    name="street"
                    as="input"
                    className={streetHasError ? inputError(!cpValid) : inputBase(!cpValid)}
                    placeholder="Ej. Av. Reforma"
                    onChange={setPartialSilent("street")}
                    onBlur={notifyFieldOnBlur("street")}
                    disabled={!cpValid}
                />
                {!cpValid ? <Help>Primero ingresa un C.P. válido.</Help> : null}
                <Error name="street" />
            </div>

            <div className="md:col-span-5">
                <Label>Exterior / Interior</Label>

                <div className="mt-1 grid grid-cols-2 gap-2">
                    <div>
                        <input
                            type="text"
                            value={extExterior}
                            className={inputBase(!cpValid)}
                            placeholder="No. Ext."
                            onChange={(e) => setExtExterior(sanitizeExt(e.target.value))}
                            onBlur={notifyExtNumberOnBlur}
                            disabled={!cpValid}
                        />
                        <Help>Ej. 123</Help>
                    </div>

                    <div>
                        <input
                            type="text"
                            value={extInterior}
                            className={inputBase(!cpValid)}
                            placeholder="No. Int."
                            onChange={(e) => setExtInterior(sanitizeInt(e.target.value))}
                            onBlur={notifyExtNumberOnBlur}
                            disabled={!cpValid}
                        />
                        <Help>Ej. 4B (opcional)</Help>
                    </div>
                </div>

                <Field name="extNumber" type="hidden" />
                <Error name="extNumber" />
            </div>

            <div className="md:col-span-12">
                <Label htmlFor="neighborhood">Colonia</Label>
                <Field
                    id="neighborhood"
                    name="neighborhood"
                    as="input"
                    className={neighHasError ? inputError(!cpValid) : inputBase(!cpValid)}
                    placeholder="Ej. Polanco"
                    onChange={setPartialSilent("neighborhood")}
                    onBlur={notifyFieldOnBlur("neighborhood")}
                    disabled={!cpValid}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    autoCapitalize="none"
                />
                <Error name="neighborhood" />
            </div>

            <div className="md:col-span-12 mt-1 flex items-center justify-end gap-2">
                {!isFirstTime && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                )}

                <button
                    type="submit"
                    onClick={markSaveIntent}
                    disabled={isSubmitting || !isValid}
                    className={cx(
                        "rounded-lg px-4 py-2 text-sm font-semibold text-white transition",
                        isSubmitting || !isValid
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-gray-900 hover:bg-black"
                    )}
                >
                    Guardar dirección
                </button>
            </div>
        </Form>
    );
}

export default function EditForm({
                                     initialValues,
                                     isFirstTime = false,
                                     onSaved,
                                     onCancel,
                                     onCpChange,
                                     onPartialChange,
                                     shipping,
                                 }) {
    const notifyParent = useMemo(
        () => (onPartialChange ? debounce(onPartialChange, 300) : null),
        [onPartialChange]
    );

    const saveIntentRef = useRef(false);
    const markSaveIntent = () => {
        saveIntentRef.current = true;
    };

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={AddressSchema}
            validateOnBlur
            validateOnChange
            onSubmit={(values, { setSubmitting }) => {
                if (!saveIntentRef.current) {
                    setSubmitting(false);
                    return;
                }
                saveIntentRef.current = false;

                onSaved?.(values);
                setSubmitting(false);
            }}
        >
            {({ values, errors, touched, isSubmitting, isValid, setFieldValue, handleBlur }) => (
                <InnerForm
                    initialValues={initialValues}
                    values={values}
                    errors={errors}
                    touched={touched}
                    setFieldValue={setFieldValue}
                    handleBlur={handleBlur}
                    isSubmitting={isSubmitting}
                    isValid={isValid}
                    onCancel={onCancel}
                    isFirstTime={isFirstTime}
                    notifyParent={notifyParent}
                    onCpChange={onCpChange}
                    shipping={shipping}
                    markSaveIntent={markSaveIntent}
                />
            )}
        </Formik>
    );
}
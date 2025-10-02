"use client";

import { useEffect, useMemo, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useGlobalContext } from "@/app/context/globalContext";
import { buildOrderSchema, cities } from "./constants";
import { tomorrowStrLocal, shouldWarnLateForTomorrow } from "@/utils/dates";
import { safeUUID } from 'utils/ids';
import LateWarningModal from "./LateWarningModal";
import LateConsentAlert from "./LateConsentAlert";
import { useRouter } from "next/navigation";

/* =========================
 *  Constantes & helpers
 * ======================== */
const MAX_IMAGES = 4;
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

function formatMB(bytes = 0) {
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function buildImageModels(files) {
    return files.map((f) => ({
        id: safeUUID(),
        name: f.name,
        size: f.size,
        type: f.type || "application/octet-stream",
        previewUrl: URL.createObjectURL(f),
        file: f,
    }));
}

// Extrae ciudades reales desde cartItems[*].options.city.city
function getCartCities(cart) {
    const list = (cart?.cartItems || [])
        .map((it) => it?.options?.city?.city)
        .filter((v) => typeof v === "string" && v.trim().length > 0);
    const unique = Array.from(new Set(list));
    return { list, unique };
}

export default function OrderForm({
                                      disabled,
                                      helper,
                                      total,
                                      selected,
                                      onAdded,
                                      onSubmitReady,
                                      onSubmitStateChange, // 🔹 Nuevo: callback al padre para reportar si el submit debe deshabilitarse
                                      product,
                                  }) {
    const { state, dispatch } = useGlobalContext();
    const router = useRouter();
    const cart = state?.cart;

    // Ciudades actuales del carrito
    const { cartCities, lockedCity, isMultiCity } = useMemo(() => {
        const { unique } = getCartCities(cart);
        return {
            cartCities: unique,
            lockedCity: unique[0] || null,
            isMultiCity: unique.length > 1,
        };
    }, [cart]);

    // Solo a partir de mañana
    const tomorrow = useMemo(() => tomorrowStrLocal(), []);
    const OrderSchema = useMemo(() => buildOrderSchema(tomorrow), [tomorrow]);

    // Modal/consentimiento
    const [warnOpen, setWarnOpen] = useState(false);
    const [warnAcknowledged, setWarnAcknowledged] = useState(false); // evita que reaparezca en el mismo flujo

    const initialValues = {
        city: null,
        date: "",
        title: "",
        message: "",
        images: [], // [{id, name, size, type, previewUrl, file}]
        lateConsent: false,
    };

    // Validación extra (imágenes y consentimiento)
    const validate = (values) => {
        const errors = {};
        const imgs = values.images || [];

        if (imgs.length > MAX_IMAGES) {
            errors.images = `Máximo ${MAX_IMAGES} imágenes.`;
        }

        const tooBig = imgs.find((m) => (m?.size ?? 0) > MAX_SIZE_BYTES);
        if (tooBig) {
            errors.images = `${tooBig.name} supera ${MAX_SIZE_MB} MB (${formatMB(tooBig.size)}).`;
        }

        if (shouldWarnLateForTomorrow(values.city, values.date, tomorrow) && !values.lateConsent) {
            // opcional:
            // errors.lateConsent = "Marca esta casilla para continuar.";
        }
        return errors;
    };

    const handleSubmit = (values, { resetForm, setSubmitting, setFieldError }) => {
        if (!selected) return;

        // ====== VALIDACIÓN DE CIUDAD CONTRA CARRITO (en el submit) ======
        // 1) si carrito tiene múltiples ciudades -> bloquear
        // 2) si carrito tiene 1 ciudad -> selected.city.city debe coincidir
        const selectedCityName = values?.city?.city || "";
        if (isMultiCity) {
            setSubmitting(false);
            setFieldError(
                "city",
                `Tu carrito ya contiene artículos de múltiples ciudades: ${cartCities.join(", ")}. Elimina los que no correspondan o vacía el carrito.`
            );
            return;
        }
        if (lockedCity && selectedCityName && selectedCityName !== lockedCity) {
            setSubmitting(false);
            setFieldError(
                "city",
                `Tu carrito es de ${lockedCity}. Crea órdenes separadas por ciudad.`
            );
            return;
        }

        const item = {
            id: selected.key,
            name: selected.name,
            price: selected.price,
            quantity: 1,
            options: {
                city: values.city,
                date: values.date,
                title: values.title,
                message: values.message,
                imagesCount: values.images?.length || 0,
                lateConsent: values.lateConsent,
            },
            images: values.images, // [{id, name, size, type, previewUrl, file}]
            image: selected.img,
            productSlug: selected.key,
            product,
        };

        dispatch({ type: "ADD_ITEM_CART", payload: item });
        onAdded?.();
        setSubmitting(false);
        resetForm();
        setWarnAcknowledged(false);
        setWarnOpen(false);
        setTimeout(() => router.push("/cart"), 250);
    };

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={OrderSchema}
            validate={validate}
            onSubmit={handleSubmit}
        >
            {({
                  isSubmitting,
                  setFieldValue,
                  setFieldError,
                  submitForm,
                  values,
                  errors,
                  touched,
              }) => {
                // Exponer submit al padre (para el botón móvil)
                useEffect(() => {
                    onSubmitReady && onSubmitReady(submitForm);
                }, [submitForm, onSubmitReady]);

                // Autoseleccionar ciudad del carrito si existe y no hay selección aún
                useEffect(() => {
                    if (!values.city && lockedCity) {
                        const found = cities.find((c) => c.city === lockedCity) || null;
                        if (found) setFieldValue("city", found, false);
                    }
                    // eslint-disable-next-line react-hooks/exhaustive-deps
                }, [lockedCity]);

                // ¿Aplica advertencia de “tarde para mañana”?
                const warnApplies =
                    shouldWarnLateForTomorrow(values.city, values.date, tomorrow) &&
                    !warnAcknowledged;

                // Abrir/cerrar modal automáticamente según condiciones
                useEffect(() => {
                    if (warnApplies) setWarnOpen(true);
                    else setWarnOpen(false);
                }, [warnApplies]);

                const handleCityChange = (e) => {
                    const value = e.target.value;
                    const cityObj = cities.find((c) => c.city === value) || null;
                    setFieldValue("city", cityObj);

                    // Reset consentimiento si cambian ciudad/fecha
                    setFieldValue("lateConsent", false);
                    setWarnAcknowledged(false);
                };

                const handleDateChange = (e) => {
                    setFieldValue("date", e.target.value);
                    setFieldValue("lateConsent", false);
                    setWarnAcknowledged(false);
                };

                // ====== VALIDACIÓN DE CIUDAD CONTRA CARRITO (en UI, para deshabilitar botón) ======
                const selectedCityName = values?.city?.city || "";
                const mismatch =
                    !!lockedCity && !!selectedCityName && selectedCityName !== lockedCity;

                const cityBlockReason = isMultiCity
                    ? `Tu carrito contiene artículos de múltiples ciudades (${cartCities.join(", ")}).`
                    : mismatch
                        ? `Tu carrito es de ${lockedCity}. Crea órdenes separadas por ciudad.`
                        : "";

                const submitDisabledByCity = Boolean(isMultiCity || mismatch);

                // 🔹 Unificamos todas las condiciones que ya usabas en el botón desktop
                const lateBlock =
                    shouldWarnLateForTomorrow(values.city, values.date, tomorrow) &&
                    !values.lateConsent;

                const unifiedDisabled =
                    disabled ||
                    isSubmitting ||
                    submitDisabledByCity ||
                    lateBlock ||
                    !!errors.images;

                // 🔹 Reportamos al padre para controlar el botón móvil
                useEffect(() => {
                    onSubmitStateChange && onSubmitStateChange(unifiedDisabled);
                    // eslint-disable-next-line react-hooks/exhaustive-deps
                }, [
                    unifiedDisabled,
                    disabled,
                    isSubmitting,
                    submitDisabledByCity,
                    values.city,
                    values.date,
                    values.lateConsent,
                    errors.images,
                ]);

                return (
                    <>
                        <Form
                            className={`mt-3 space-y-4 ${
                                disabled ? "opacity-60 pointer-events-none" : ""
                            }`}
                        >
                            {helper && <div className="text-sm text-gray-600">{helper}</div>}

                            {/* Ciudad */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Ciudad</label>
                                <select
                                    className="w-full rounded-md border px-3 py-2 bg-white"
                                    onChange={handleCityChange}
                                    value={values.city?.city || ""}
                                    disabled={disabled}
                                >
                                    <option value="" disabled>
                                        Selecciona ciudad
                                    </option>
                                    {cities.map((c) => (
                                        <option key={c.city} value={c.city}>
                                            {c.city}
                                        </option>
                                    ))}
                                </select>

                                {/* Errores del schema / submit */}
                                <ErrorMessage
                                    name="city"
                                    component="div"
                                    className="mt-1 text-xs text-red-600"
                                />

                                {/* Mensajes de validación de ciudad en tiempo real */}
                                {cityBlockReason && (
                                    <div className="mt-1 text-xs text-amber-700">
                                        {cityBlockReason}
                                    </div>
                                )}

                                {/* Hint pickup si hay ciudad */}
                                {values.city?.pickup && (
                                    <p className="mt-1 text-xs text-gray-600">
                                        Envío a domicilio o Pickup en:{" "}
                                        <strong>{values.city.pickup}</strong>
                                    </p>
                                )}
                            </div>

                            {/* Fecha (mínimo mañana) */}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Fecha de entrega
                                </label>
                                <Field
                                    type="date"
                                    name="date"
                                    min={tomorrow}
                                    className="w-full rounded-md border px-3 py-2"
                                    onChange={handleDateChange}
                                />
                                <ErrorMessage
                                    name="date"
                                    component="div"
                                    className="mt-1 text-xs text-red-600"
                                />
                            </div>

                            {/* Título */}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Título / Subtítulo
                                </label>
                                <Field
                                    type="text"
                                    name="title"
                                    placeholder="Escribe tu texto"
                                    className="w-full rounded-md border px-3 py-2"
                                />
                                <div className="mt-1 flex items-center justify-between">
                                    <ErrorMessage
                                        name="title"
                                        component="div"
                                        className="text-xs text-red-600"
                                    />
                                    <span className="text-[11px] text-gray-500">
                                        {values.title?.length || 0}/60
                                    </span>
                                </div>
                            </div>

                            {/* Mensaje */}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Firma / Mensaje
                                </label>
                                <Field
                                    as="textarea"
                                    rows={3}
                                    name="message"
                                    className="w-full rounded-md border px-3 py-2"
                                />
                                <div className="mt-1 flex items-center justify-between">
                                    <ErrorMessage
                                        name="message"
                                        component="div"
                                        className="text-xs text-red-600"
                                    />
                                    <span className="text-[11px] text-gray-500">
                                        {values.message?.length || 0}/240
                                    </span>
                                </div>
                            </div>

                            {/* Imágenes */}
                            <div>
                                <label className="block text-sm text-gray-700 font-medium mb-1">
                                    Sube tus imágenes (máx. {MAX_IMAGES})
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="block w-full text-sm"
                                    onChange={(e) => {
                                        const picked = Array.from(e.target.files || []);
                                        const msgs = [];

                                        if (picked.length === 0) return;

                                        // Validar tamaño y construir modelos NUEVOS
                                        const validFiles = [];
                                        for (const f of picked) {
                                            if (f.size > MAX_SIZE_BYTES) {
                                                msgs.push(`${f.name} supera ${MAX_SIZE_MB} MB (${formatMB(f.size)}).`);
                                            } else {
                                                validFiles.push(f);
                                            }
                                        }

                                        const newModels = buildImageModels(validFiles);

                                        // Mezclar con las imágenes YA seleccionadas
                                        const prev = Array.isArray(values.images) ? values.images : [];
                                        const merged = [...prev, ...newModels];

                                        // Respetar el tope de 4 y avisar si se recorta
                                        let finalList = merged;
                                        if (merged.length > MAX_IMAGES) {
                                            msgs.push(`Máximo ${MAX_IMAGES} imágenes; se tomarán las primeras ${MAX_IMAGES}.`);
                                            finalList = merged.slice(0, MAX_IMAGES);
                                        }

                                        setFieldValue("images", finalList);

                                        if (msgs.length) {
                                            setFieldError("images", msgs.join("\n"));
                                        } else {
                                            setFieldError("images", undefined);
                                        }

                                        // Limpia el input para permitir volver a seleccionar el mismo archivo si se quiere
                                        e.target.value = "";
                                    }}
                                />

                                {/* Errores (en bloque, multi-línea) */}
                                {errors.images && (
                                    <div className="mt-1 text-xs text-red-600 whitespace-pre-line">
                                        {errors.images}
                                    </div>
                                )}

                                {/* Previews */}
                                {values.images?.length > 0 && (
                                    <div className="mt-2 space-y-2">
                                        <div className="text-xs text-gray-600">
                                            {values.images.length} archivo(s) aceptado(s)
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {values.images.map((m) => (
                                                <div key={m.id} className="border rounded p-1 relative">
                                                    <img
                                                        src={m.previewUrl}
                                                        alt={m.name}
                                                        className="w-full h-24 object-cover rounded"
                                                    />
                                                    <div className="mt-1 text-[11px] text-gray-600 break-words">
                                                        {m.name} — {formatMB(m.size)}
                                                    </div>

                                                    {/* Botón eliminar */}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            // Revocar URL y quitar del arreglo
                                                            try { URL.revokeObjectURL(m.previewUrl); } catch {}
                                                            const next = (values.images || []).filter((x) => x.id !== m.id);
                                                            setFieldValue("images", next);
                                                            // Limpia errores si ya no aplican
                                                            if (next.length <= MAX_IMAGES) setFieldError("images", undefined);
                                                        }}
                                                        className="absolute top-1 right-1 rounded-full bg-white/90 border px-2 py-0.5 text-[11px] hover:bg-white"
                                                        title="Quitar imagen"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Total */}
                            <div className="pt-2 flex items-center justify-between">
                                <span className="text-sm text-gray-600">Total</span>
                                <span className="text-xl font-semibold">
                                    ${total} <span className="text-xs">MXN</span>
                                </span>
                            </div>

                            {/* Desktop */}
                            <button
                                type="submit"
                                disabled={unifiedDisabled}
                                className="mt-2 hidden md:inline-flex items-center justify-center rounded-full border px-6 py-2 font-medium hover:bg-gray-50 disabled:opacity-60"
                                title={
                                    submitDisabledByCity
                                        ? (isMultiCity
                                            ? `Tu carrito contiene artículos de múltiples ciudades (${cartCities.join(", ")}).`
                                            : `Tu carrito es de ${lockedCity}.`)
                                        : (isSubmitting ? "Agregando..." : "Agregar al carrito")
                                }
                            >
                                {isSubmitting ? "Agregando..." : "Agregar al carrito"}
                            </button>
                        </Form>

                        {/* Modal de advertencia */}
                        <LateWarningModal
                            open={warnOpen}
                            cityName={values.city?.city || ""}
                            onClose={() => {
                                setWarnOpen(false);
                            }}
                            onAccept={() => {
                                setWarnAcknowledged(true);
                                setWarnOpen(false);
                                setFieldValue("lateConsent", true);
                            }}
                        />
                    </>
                );
            }}
        </Formik>
    );
}
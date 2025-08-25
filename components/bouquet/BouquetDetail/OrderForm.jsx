"use client";

import { useEffect, useMemo, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useGlobalContext } from "@/app/context/globalContext";
import { buildOrderSchema, cities } from "./constants";
import { tomorrowStrLocal, shouldWarnLateForTomorrow } from "@/utils/dates";
import LateWarningModal from "./LateWarningModal";
import LateConsentAlert from "./LateConsentAlert";

export default function OrderForm({
      disabled,
      helper,
      total,
      selected,
      onAdded,
      onSubmitReady,
      product
  }) {
    const { dispatch } = useGlobalContext();

    // Solo a partir de mañana
    const tomorrow = useMemo(() => tomorrowStrLocal(), []);
    const OrderSchema = useMemo(() => buildOrderSchema(tomorrow), [tomorrow]);

    // Modal/consentimiento
    const [warnOpen, setWarnOpen] = useState(false);
    const [warnAcknowledged, setWarnAcknowledged] = useState(false); // evita que reaparezca en el mismo flujo

    const initialValues = {
        city: null,   // { city, pickup }
        date: "",
        title: "",
        message: "",
        images: [],
        lateConsent: false,
    };

    // Validación extra
    const validate = (values) => {
        const errors = {};
        if (values.images && values.images.length > 4) {
            errors.images = "Máximo 4 imágenes";
        }
        // Si aplica advertencia y no hay consentimiento, el botón submit queda deshabilitado;
        // puedes también forzar mensaje en errors.lateConsent si quieres:
        if (shouldWarnLateForTomorrow(values.city, values.date, tomorrow) && !values.lateConsent) {
            // errors.lateConsent = "Marca esta casilla para continuar.";
        }
        return errors;
    };

    const handleSubmit = (values, { resetForm, setSubmitting }) => {
        if (!selected) return;

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
    };

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={OrderSchema}
            validate={validate}
            onSubmit={handleSubmit}
        >
            {({ isSubmitting, setFieldValue, submitForm, values, errors, touched }) => {
                // Exponer submit al padre (para el botón móvil)
                useEffect(() => {
                    onSubmitReady && onSubmitReady(submitForm);
                }, [submitForm, onSubmitReady]);

                // ¿Aplica advertencia?
                const warnApplies = shouldWarnLateForTomorrow(values.city, values.date, tomorrow) && !warnAcknowledged;

                // Abrir/cerrar modal automáticamente según condiciones
                useEffect(() => {
                    if (warnApplies) {
                        setWarnOpen(true);
                    } else {
                        setWarnOpen(false);
                    }
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

                // Mostrar el alert con checkbox si:
                // - aplica la advertencia (aún no aceptada), o
                // - ya aceptó en el modal (lateConsent === true) para que quede visible la explicación.
                const showInlineAlert = shouldWarnLateForTomorrow(values.city, values.date, tomorrow) || values.lateConsent;

                return (
                    <>
                        <Form
                            className={`mt-3 space-y-4 ${disabled ? "opacity-60 pointer-events-none" : ""}`}
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
                                <ErrorMessage
                                    name="city"
                                    component="div"
                                    className="mt-1 text-xs text-red-600"
                                />

                                {/* Hint pickup si hay ciudad */}
                                {values.city?.pickup && (
                                    <p className="mt-1 text-xs text-gray-600">
                                        Envío a domicilio o Pickup en: <strong>{values.city.pickup}</strong>
                                    </p>
                                )}
                            </div>

                            {/* Fecha (mínimo mañana) */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Fecha de entrega</label>
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

                            {/* ALERT + CHECKBOX (inline en el form) */}
                            {showInlineAlert && (
                                <LateConsentAlert city={values.city?.city} />
                            )}

                            {/* Título */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Título / Subtítulo</label>
                                <Field
                                    type="text"
                                    name="title"
                                    placeholder="Escribe tu texto"
                                    className="w-full rounded-md border px-3 py-2"
                                />
                                <div className="mt-1 flex items-center justify-between">
                                    <ErrorMessage name="title" component="div" className="text-xs text-red-600" />
                                    <span className="text-[11px] text-gray-500">
                    {values.title?.length || 0}/60
                  </span>
                                </div>
                            </div>

                            {/* Mensaje */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Firma / Mensaje</label>
                                <Field
                                    as="textarea"
                                    rows={3}
                                    name="message"
                                    className="w-full rounded-md border px-3 py-2"
                                />
                                <div className="mt-1 flex items-center justify-between">
                                    <ErrorMessage name="message" component="div" className="text-xs text-red-600" />
                                    <span className="text-[11px] text-gray-500">
                    {values.message?.length || 0}/240
                  </span>
                                </div>
                            </div>

                            {/* Imágenes */}
                            <div>
                                <label className="block text-sm text-gray-700 font-medium mb-1">
                                    Sube tus imágenes (máx. 4)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="block w-full text-sm"
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files || []);
                                        setFieldValue("images", files.slice(0, 4));
                                    }}
                                />
                                {(errors.images || touched.images) && (
                                    <div className="mt-1 text-xs text-red-600">
                                        {errors.images}
                                    </div>
                                )}
                                {values.images?.length > 0 && (
                                    <div className="mt-2 text-xs text-gray-600">
                                        {values.images.length} archivo(s) seleccionado(s)
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
                                disabled={
                                    disabled ||
                                    isSubmitting ||
                                    (shouldWarnLateForTomorrow(values.city, values.date, tomorrow) && !values.lateConsent)
                                }
                                className="mt-2 hidden md:inline-flex items-center justify-center rounded-full border px-6 py-2 font-medium hover:bg-gray-50 disabled:opacity-60"
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
                                // No marcamos consentimiento; el botón submit seguirá deshabilitado
                            }}
                            onAccept={() => {
                                // Marca consentimiento y recuerda que ya aceptó en este flujo
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
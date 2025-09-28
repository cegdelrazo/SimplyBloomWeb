"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useMemo, useRef } from "react";

// ================= Validación =================
const AddressSchema = Yup.object({
    fullName: Yup.string().trim().required("Requerido"),
    phone: Yup.string()
        .required("Requerido")
        .test("phone-10", "Debe tener 10 dígitos", v => !!v && v.replace(/\D/g, "").length === 10),
    cp: Yup.string().required("Requerido").matches(/^\d{5}$/, "Debe tener 5 dígitos"),
    street: Yup.string().trim().required("Requerido"),
    extNumber: Yup.string().trim().max(10, "Muy largo"),
    neighborhood: Yup.string().trim().required("Requerido"),
});

function Label({ children }) {
    return <label className="text-[11px] text-gray-600">{children}</label>;
}
function Error({ name }) {
    return <ErrorMessage name={name} component="div" className="mt-1 text-[11px] text-red-600" />;
}

// Debounce util
const debounce = (fn, ms = 300) => {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
};

export default function EditForm({
                                     initialValues,
                                     isFirstTime = false,
                                     onSaved,
                                     onCancel,
                                     onCpChange,
                                     onPartialChange, // <- seguirá existiendo pero la llamaremos SOLO en blur/debounce
                                     shipping,
                                 }) {
    // Notificador al padre con debounce (para evitar “auto-guardar” inmediato)
    const notifyParent = useMemo(
        () => (onPartialChange ? debounce(onPartialChange, 300) : null),
        [onPartialChange]
    );

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={AddressSchema}
            validateOnBlur
            validateOnChange
            // PROTECCIÓN: ignorar submits que no vengan del botón "Guardar"
            onSubmit={(values, { setSubmitting, event }) => {
                const submitter = event?.nativeEvent?.submitter;
                const fromSaveButton = submitter?.getAttribute?.("name") === "saveBtn";
                if (!fromSaveButton) {
                    setSubmitting(false);
                    return; // Ignora cualquier submit “fantasma”
                }
                onSaved?.(values);
                setSubmitting(false);
            }}
        >
            {({ values, isSubmitting, isValid, setFieldValue, handleBlur }) => {
                const cpValid = /^\d{5}$/.test(values.cp);

                // Cambios “silenciosos”: NO notifican al padre en cada tecla
                const setPartialSilent = (field, transform) => (e) => {
                    const raw = e.target.value;
                    const v = transform ? transform(raw) : raw;
                    setFieldValue(field, v, true);
                };

                // Notificar al padre SOLO en blur (y opcionalmente debounce)
                const notifyFieldOnBlur = (field) => (e) => {
                    handleBlur(e); // mantiene la validación de Formik
                    if (notifyParent) notifyParent({ ...values, [field]: values[field] });
                };

                const handleCp = (e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 5);
                    setFieldValue("cp", v, true);
                    // Para CP sí podemos notificar de inmediato si lo necesitas
                    onCpChange?.(v);
                    if (notifyParent) notifyParent({ ...values, cp: v });
                };

                return (
                    <Form className="grid grid-cols-1 md:grid-cols-12 gap-3" noValidate>
                        {/* ==== Contacto ==== */}
                        <div className="md:col-span-12">
                            <p className="text-xs font-semibold text-gray-900">Contacto</p>
                        </div>

                        <div className="md:col-span-7">
                            <Label>Quién recibe</Label>
                            <Field
                                name="fullName"
                                as="input"
                                className="mt-1 w-full rounded-lg border px-3 py-2"
                                placeholder="Nombre y apellido"
                                onChange={setPartialSilent("fullName")}
                                onBlur={notifyFieldOnBlur("fullName")}
                            />
                            <Error name="fullName" />
                        </div>

                        <div className="md:col-span-5">
                            <Label>Teléfono</Label>
                            <Field
                                name="phone"
                                as="input"
                                type="tel"
                                inputMode="tel"
                                maxLength={10}
                                className="mt-1 w-full rounded-lg border px-3 py-2"
                                placeholder="5512345678"
                                onChange={setPartialSilent("phone", v => v.replace(/\D/g, "").slice(0, 10))}
                                onBlur={notifyFieldOnBlur("phone")}
                            />
                            <Error name="phone" />
                        </div>

                        <div className="md:col-span-12 border-t mt-2 pt-2" />

                        {/* ==== Ubicación ==== */}
                        <div className="md:col-span-12">
                            <p className="text-xs font-semibold text-gray-900">Ubicación</p>
                        </div>

                        <div className="md:col-span-4">
                            <Label>C.P.</Label>
                            <Field
                                name="cp"
                                as="input"
                                type="text"
                                inputMode="numeric"
                                maxLength={5}
                                className="mt-1 w-full rounded-lg border px-3 py-2"
                                placeholder="11560"
                                onChange={handleCp}
                                onBlur={notifyFieldOnBlur("cp")}
                            />
                            <Error name="cp" />

                            {/* Estado de envío */}
                            <div className="mt-2 text-[12px]">
                                {values.cp?.length === 5 ? (
                                    shipping?.valid ? (
                                        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800">
                                            <div className="font-medium">Envío: ${shipping.cost}</div>
                                        </div>
                                    ) : (
                                        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
                                            {shipping?.note || "Ingresa un CP válido de 5 dígitos."}
                                        </div>
                                    )
                                ) : (
                                    <p className="text-gray-500">El envío se calcula con el C.P.</p>
                                )}
                            </div>
                        </div>

                        <div className="md:col-span-12 border-t mt-2 pt-2" />

                        {/* ==== Dirección ==== */}
                        <div className="md:col-span-12">
                            <p className="text-xs font-semibold text-gray-900">Dirección</p>
                        </div>

                        <div className="md:col-span-7">
                            <Label>Calle</Label>
                            <Field
                                name="street"
                                as="input"
                                className="mt-1 w-full rounded-lg border px-3 py-2"
                                placeholder="Calle"
                                onChange={setPartialSilent("street")}
                                onBlur={notifyFieldOnBlur("street")}
                                disabled={!cpValid}
                            />
                            <Error name="street" />
                        </div>

                        <div className="md:col-span-5">
                            <Label>No. Ext.</Label>
                            <Field
                                name="extNumber"
                                as="input"
                                className="mt-1 w-full rounded-lg border px-3 py-2"
                                placeholder="123"
                                onChange={setPartialSilent("extNumber")}
                                onBlur={notifyFieldOnBlur("extNumber")}
                                disabled={!cpValid}
                            />
                            <Error name="extNumber" />
                        </div>

                        <div className="md:col-span-12">
                            <Label>Colonia</Label>
                            <Field
                                name="neighborhood"
                                as="input"
                                className="mt-1 w-full rounded-lg border px-3 py-2"
                                placeholder="Colonia"
                                onChange={setPartialSilent("neighborhood")}     // ⬅️ sin notificar en cada tecla
                                onBlur={notifyFieldOnBlur("neighborhood")}      // ⬅️ notifica SOLO al salir del campo
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
                                    className="rounded-lg border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                            )}
                            <button
                                type="submit"
                                name="saveBtn" // ⬅️ para identificar el submit legítimo
                                disabled={isSubmitting || !isValid}
                                className={`rounded-lg px-4 py-2 text-sm text-white ${
                                    isSubmitting || !isValid ? "bg-gray-300 cursor-not-allowed" : "bg-gray-900 hover:bg-black"
                                }`}
                            >
                                Guardar
                            </button>
                        </div>
                    </Form>
                );
            }}
        </Formik>
    );
}
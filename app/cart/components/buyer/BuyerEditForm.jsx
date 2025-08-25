"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const BuyerSchema = Yup.object({
    fullName: Yup.string().trim().required("Requerido"),
    phone: Yup.string()
        .required("Requerido")
        .test("phone-10", "Debe tener 10 dígitos", (v) => !!v && v.replace(/\D/g, "").length === 10),
    email: Yup.string().trim().email("Correo inválido").required("Requerido"),
});

function Label({ children }) {
    return <label className="text-[11px] text-gray-600">{children}</label>;
}
function Error({ name }) {
    return <ErrorMessage name={name} component="div" className="mt-1 text-[11px] text-red-600" />;
}

export default function BuyerEditForm({ initialValues, isFirstTime = false, onSaved, onCancel }) {
    return (
        <Formik
            initialValues={initialValues}
            validationSchema={BuyerSchema}
            enableReinitialize
            validateOnBlur
            validateOnChange
            onSubmit={(values, { setSubmitting }) => {
                onSaved?.(values);
                setSubmitting(false);
            }}
        >
            {({ setFieldValue, isSubmitting, isValid }) => {
                const handlePhone = (e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setFieldValue("phone", v, true);
                };

                return (
                    <Form className="space-y-3">
                        {/* Nombre y Apellido (mismo input) */}
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

                        {/* Teléfono */}
                        <div>
                            <Label>Teléfono</Label>
                            <Field
                                name="phone"
                                as="input"
                                type="tel"
                                inputMode="tel"
                                maxLength={10}
                                className="mt-1 w-full rounded-lg border px-3 py-2"
                                placeholder="5512345678"
                                onChange={handlePhone}
                            />
                            <p className="mt-1 text-[11px] text-gray-500">10 dígitos (MX).</p>
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
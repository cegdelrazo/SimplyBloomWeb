"use client";

import { useMemo, useState } from "react";
import { useGlobalContext } from "@/app/context/globalContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const BuyerSchema = Yup.object({
    firstName: Yup.string()
        .trim()
        .min(2, "Mínimo 2 caracteres")
        .max(60, "Máximo 60")
        .required("Requerido"),
    lastName: Yup.string()
        .trim()
        .min(2, "Mínimo 2 caracteres")
        .max(60, "Máximo 60")
        .required("Requerido"),
    phone: Yup.string()
        .trim()
        // Solo dígitos, 8 a 15 (MX/intl simple). Ajusta si quieres formato específico.
        .matches(/^\d{8,15}$/, "Usa solo dígitos (8–15)")
        .required("Requerido"),
    email: Yup.string()
        .trim()
        .email("Correo inválido")
        .required("Requerido"),
});

function isEmptyBuyer(buyer) {
    if (!buyer) return true;
    const { firstName, lastName, phone, email } = buyer;
    return !firstName && !lastName && !phone && !email;
}

export default function BuyerInfoForm() {
    const {
        state: { cart },
        dispatch,
    } = useGlobalContext();

    const buyer = cart?.buyer ?? {};
    const [editing, setEditing] = useState(() => isEmptyBuyer(buyer));

    const initialValues = useMemo(
        () => ({
            firstName: buyer.firstName || "",
            lastName: buyer.lastName || "",
            phone: (buyer.phone || "").replace(/\D/g, ""),
            email: buyer.email || "",
        }),
        [buyer]
    );

    return (
        <section className="rounded-2xl border bg-white p-4 md:p-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                    Contacto
                </h3>

                {!editing && (
                    <button
                        type="button"
                        onClick={() => setEditing(true)}
                        className="rounded-full border px-3 py-1.5 text-sm hover:bg-gray-50"
                    >
                        Editar
                    </button>
                )}
            </div>
            <div className="flex items-center justify-between">
                <p className="text-xs text-gray-600">
                    Asegúrate que todos tus datos estén correctos, de lo contrario no podremos entregar el pedido.
                </p>
            </div>

            {/* Vista lectura */}
            {!editing && (
                <div className="mt-4 space-y-1 text-sm text-gray-700">
                    <p>
                        <span className="font-medium">Nombre: </span>
                        {buyer.firstName} {buyer.lastName}
                    </p>
                    <p>
                        <span className="font-medium">Teléfono: </span>
                        {buyer.phone}
                    </p>
                    <p>
                        <span className="font-medium">Correo: </span>
                        {buyer.email}
                    </p>
                </div>
            )}

            {/* Formulario con Formik + Yup */}
            {editing && (
                <Formik
                    enableReinitialize
                    initialValues={initialValues}
                    validationSchema={BuyerSchema}
                    onSubmit={(values, { setSubmitting }) => {
                        // normaliza phone a solo dígitos
                        const payload = { ...values, phone: values.phone.replace(/\D/g, "") };
                        dispatch({ type: "SET_BUYER", payload });
                        setSubmitting(false);
                        setEditing(false);
                    }}
                >
                    {({ isSubmitting, isValid, dirty, setFieldValue, values }) => (
                        <Form className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FieldWrapper label="Nombre" name="firstName">
                                <Field
                                    name="firstName"
                                    type="text"
                                    className="w-full rounded-md border px-3 py-2"
                                    placeholder="Nombre"
                                />
                            </FieldWrapper>

                            <FieldWrapper label="Apellido" name="lastName">
                                <Field
                                    name="lastName"
                                    type="text"
                                    className="w-full rounded-md border px-3 py-2"
                                    placeholder="Apellido"
                                />
                            </FieldWrapper>

                            <FieldWrapper label="Teléfono" name="phone">
                                <Field
                                    name="phone"
                                    type="tel"
                                    inputMode="numeric"
                                    className="w-full rounded-md border px-3 py-2"
                                    placeholder="5512345678"
                                    onChange={(e) => {
                                        const onlyDigits = e.target.value.replace(/\D/g, "");
                                        setFieldValue("phone", onlyDigits);
                                    }}
                                    value={values.phone}
                                />
                            </FieldWrapper>

                            <FieldWrapper label="Correo electrónico" name="email">
                                <Field
                                    name="email"
                                    type="email"
                                    className="w-full rounded-md border px-3 py-2"
                                    placeholder="tu@correo.com"
                                />
                            </FieldWrapper>

                            <div className="md:col-span-2 mt-2 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEditing(false)}
                                    className="rounded-full border px-5 py-2 text-sm hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !(isValid && dirty)}
                                    className="rounded-full bg-brand-pink px-6 py-2 text-sm font-semibold text-white
                             disabled:opacity-50 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-pink"
                                >
                                    Guardar información
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            )}
        </section>
    );
}

/* ---------- Helpers ---------- */

function FieldWrapper({ label, name, children }) {
    return (
        <div>
            <label htmlFor={name} className="block text-sm text-gray-700 mb-1">
                {label}
            </label>
            {children}
            <ErrorMessage
                name={name}
                component="p"
                className="mt-1 text-xs text-red-600"
            />
        </div>
    );
}
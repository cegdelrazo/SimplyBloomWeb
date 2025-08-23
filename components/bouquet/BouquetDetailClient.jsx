"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import * as Yup from "yup";
import { Formik, Form, Field, ErrorMessage } from "formik";

import Hero from "@/components/bouquet/Hero";
import ThumbsWithLightbox from "@/components/bouquet/ThumbsWithLightbox";
import { useGlobalContext } from "@/app/context/globalContext";

// Opciones de ramos
const RAMOS = [
    { key: "rose", name: "RAMO ROSE", price: 800, img: "/media/bouquets/rose.webp" },
    { key: "lino", name: "RAMO LINO", price: 900, img: "/media/bouquets/lino.webp" },
];

// Validación con Yup
const OrderSchema = Yup.object().shape({
    city: Yup.string().required("Selecciona una ciudad"),
    date: Yup.string().required("Elige una fecha"),
    title: Yup.string().max(60, "Máximo 60 caracteres"),
    message: Yup.string().max(240, "Máximo 240 caracteres"),
});

export default function BouquetDetailClient({ product }) {
    if (!product) {
        return <main className="pt-24 container">No se encontró el producto.</main>;
    }

    const [choice, setChoice] = useState(null);
    const selected = RAMOS.find((r) => r.key === choice) || null;

    const gallery = useMemo(() => {
        if (Array.isArray(product.gallery) && product.gallery.length) return product.gallery;
        return [product.img];
    }, [product]);

    const heroSrc = selected?.img || gallery[0];

    // Toast
    const [toastOpen, setToastOpen] = useState(false);
    const showToast = () => setToastOpen(true);

    // Para que el botón móvil ejecute el mismo submit del formulario
    const submitRef = useRef(null); // guardaremos aquí la función submitForm de Formik

    return (
        <main>
            <Hero src={heroSrc} title={product.name} subtitle={product.subtitle} />
            <ThumbsWithLightbox images={gallery} />

            <div className="container">
                <div className="my-6 h-[2px] bg-brand-pink/80" />
            </div>

            <section className="container grid gap-6 md:gap-10 md:grid-cols-2">
                <RamoPicker ramos={RAMOS} choice={choice} onChange={setChoice} />

                <aside className="md:sticky md:top-24 self-start rounded-2xl border bg-white p-4 sm:p-6">
                    <h3 className="text-2xl md:text-3xl font-semibold">Personaliza</h3>
                    <OrderForm
                        disabled={!selected}
                        helper={!selected ? "Primero elige un tipo de ramo." : ""}
                        total={selected?.price ?? 0}
                        selected={selected}
                        onAdded={showToast}
                        onSubmitReady={(submitForm) => (submitRef.current = submitForm)}
                    />
                </aside>
            </section>

            <BottomBarMobile
                total={selected?.price ?? 0}
                disabled={!selected}
                onClick={() => submitRef.current && submitRef.current()}
            />

            <Toast open={toastOpen} onClose={() => setToastOpen(false)}>
        <span className="inline-flex items-center gap-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-green-700/40">
            ✅
          </span>
          Agregado al carrito
        </span>
            </Toast>
        </main>
    );
}

/* ----------------- Subcomponentes ----------------- */

function RamoPicker({ ramos, choice, onChange }) {
    return (
        <div className="rounded-2xl border bg-white p-4 sm:p-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl md:text-3xl font-semibold">Elige tu ramo</h2>
                <Link href="/#productos" className="text-sm underline">
                    ← Volver a productos
                </Link>
            </div>
            <p className="mt-1 text-sm text-gray-600">
                Puede variar según la disponibilidad, pero mantiene la misma esencia y apariencia.
            </p>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                {ramos.map((r) => {
                    const active = choice === r.key;
                    return (
                        <button
                            key={r.key}
                            type="button"
                            onClick={() => onChange(r.key)}
                            className={`group text-left rounded-2xl border overflow-hidden transition ${
                                active ? "border-black" : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                            <div className="aspect-[4/3] w-full overflow-hidden">
                                <img
                                    src={r.img}
                                    alt={r.name}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                                    loading="lazy"
                                    fetchPriority="low"
                                />
                            </div>
                            <div className="h-[2px] bg-brand-pink" />
                            <div className="p-3 flex items-baseline justify-between">
                                <div className="font-serif text-lg">{r.name}</div>
                                <div className="text-lg font-semibold">
                                    ${r.price}
                                    <span className="text-[10px] align-super ml-1">MXN</span>
                                </div>
                            </div>
                            <div
                                className={`mx-3 mb-3 inline-flex items-center gap-2 rounded-full border px-4 py-1 text-sm transition ${
                                    active ? "bg-black text-white border-black" : "hover:bg-gray-50"
                                }`}
                            >
                                {active ? "Seleccionado" : "Elegir este ramo"}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function OrderForm({ disabled, helper, total, selected, onAdded, onSubmitReady }) {
    const { dispatch } = useGlobalContext();

    // Valores iniciales
    const initialValues = {
        city: "CDMX",
        date: "",
        title: "",
        message: "",
        images: [], // FileList simulada como array
    };

    // Validación adicional para imágenes
    const validateImages = (values) => {
        const errors = {};
        if (values.images && values.images.length > 4) {
            errors.images = "Máximo 4 imágenes";
        }
        return errors;
    };

    const handleSubmit = (values, { resetForm, setSubmitting }) => {
        if (!selected) return;

        // Armamos el item para el carrito
        const item = {
            id: selected.key, // si usas algo distinto, cámbialo
            name: selected.name,
            price: selected.price,
            quantity: 1,
            options: {
                city: values.city,
                date: values.date,
                title: values.title,
                message: values.message,
                // No guardo los archivos en el store (suelen ir a upload primero)
                imagesCount: values.images?.length || 0,
            },
            image: selected.img,
            productSlug: selected.key,
        };
        console.log(item);
        dispatch({ type: "ADD_ITEM_CART", payload: item });

        onAdded?.();
        setSubmitting(false);
        resetForm();
    };

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={OrderSchema}
            validate={validateImages}
            onSubmit={handleSubmit}
        >
            {({ isSubmitting, setFieldValue, submitForm, values, errors, touched }) => {
                // Exponemos submit al padre para que el botón móvil lo dispare
                useEffect(() => {
                    onSubmitReady && onSubmitReady(submitForm);
                }, [submitForm, onSubmitReady]);

                return (
                    <Form className={`mt-3 space-y-4 ${disabled ? "opacity-60 pointer-events-none" : ""}`}>
                        {helper && <div className="text-sm text-gray-600">{helper}</div>}

                        {/* Ciudad */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Ciudad</label>
                            <Field as="select" name="city" className="w-full rounded-md border px-3 py-2 bg-white">
                                <option value="CDMX">CDMX</option>
                                <option value="Guadalajara">Guadalajara</option>
                                <option value="Monterrey">Monterrey</option>
                            </Field>
                            <ErrorMessage name="city" component="div" className="mt-1 text-xs text-red-600" />
                        </div>

                        {/* Fecha */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Fecha de entrega</label>
                            <Field type="date" name="date" className="w-full rounded-md border px-3 py-2" />
                            <ErrorMessage name="date" component="div" className="mt-1 text-xs text-red-600" />
                        </div>

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
                                <span className="text-[11px] text-gray-500">{values.title?.length || 0}/60</span>
                            </div>
                        </div>

                        {/* Mensaje */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Firma / Mensaje</label>
                            <Field as="textarea" rows={3} name="message" className="w-full rounded-md border px-3 py-2" />
                            <div className="mt-1 flex items-center justify-between">
                                <ErrorMessage name="message" component="div" className="text-xs text-red-600" />
                                <span className="text-[11px] text-gray-500">{values.message?.length || 0}/240</span>
                            </div>
                        </div>

                        {/* Imágenes */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Sube tus imágenes (máx. 4)</label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="block w-full text-sm"
                                onChange={(e) => {
                                    const files = Array.from(e.target.files || []);
                                    if (files.length > 4) {
                                        // cortamos a 4 y mostramos mensaje
                                        setFieldValue("images", files.slice(0, 4));
                                    } else {
                                        setFieldValue("images", files);
                                    }
                                }}
                            />
                            {(errors.images || touched.images) && (
                                <div className="mt-1 text-xs text-red-600">{errors.images}</div>
                            )}
                            {values.images?.length > 0 && (
                                <div className="mt-2 text-xs text-gray-600">{values.images.length} archivo(s) seleccionado(s)</div>
                            )}
                        </div>

                        {/* Total */}
                        <div className="pt-2 flex items-center justify-between">
                            <span className="text-sm text-gray-600">Total</span>
                            <span className="text-xl font-semibold">
                ${total} <span className="text-xs">MXN</span>
              </span>
                        </div>

                        {/* Botón (solo desktop, en mobile usamos la barra) */}
                        <button
                            type="submit"
                            disabled={disabled || isSubmitting}
                            className="mt-2 hidden md:inline-flex items-center justify-center rounded-full border px-6 py-2 font-medium hover:bg-gray-50 disabled:opacity-60"
                        >
                            {isSubmitting ? "Agregando..." : "Agregar al carrito"}
                        </button>
                    </Form>
                );
            }}
        </Formik>
    );
}

function BottomBarMobile({ total, disabled, onClick }) {
    return (
        <div className="md:hidden sticky bottom-0 left-0 right-0 z-20 border-t bg-white/95 backdrop-blur">
            <div className="container py-3 flex items-center justify-between">
                <div className="text-base">
                    <span className="text-gray-600 text-sm">Total</span>{" "}
                    <span className="font-semibold">${total}</span>{" "}
                    <span className="text-[10px] align-super">MXN</span>
                </div>
                <button
                    onClick={onClick}
                    className="rounded-full border px-5 py-2 text-sm font-medium disabled:opacity-60"
                    disabled={disabled}
                >
                    Agregar al carrito
                </button>
            </div>
        </div>
    );
}

/* -------- Toast minimalista -------- */
function Toast({ open, onClose, children }) {
    useEffect(() => {
        if (!open) return;
        const t = setTimeout(() => onClose && onClose(), 2200);
        return () => clearTimeout(t);
    }, [open, onClose]);

    return (
        <div
            className={`fixed left-1/2 -translate-x-1/2 bottom-4 z-50 transition-all duration-300 ${
                open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
            }`}
        >
            <div className="rounded-full border bg-white/95 backdrop-blur px-4 py-2 shadow-md text-sm">{children}</div>
        </div>
    );
}
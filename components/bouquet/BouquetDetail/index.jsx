"use client";

import { useMemo, useRef, useState } from "react";
import Hero from "@/components/bouquet/Hero";
import ThumbsWithLightbox from "@/components/bouquet/ThumbsWithLightbox";

import RamoPicker from "./RamoPicker";
import OrderForm from "./OrderForm";
import BottomBarMobile from "./BottomBarMobile";
import Toast from "./Toast";
import { RAMOS } from "./constants";

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

    const [toastOpen, setToastOpen] = useState(false);
    const showToast = () => setToastOpen(true);

    const submitRef = useRef(null);

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

            <Toast open={toastOpen} onClose={() => setToastOpen(false)} />
        </main>
    );
}
"use client";

import ProductCard from "./ProductCard";
import { PRODUCTS } from "@/lib/products";

export default function ProductsCarousel({ title = "PRODUCTOS", viewAllHref = "#" }) {
    return (
        <section className="container py-14" id="productos">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl md:text-4xl font-semibold">{title}</h2>
                <a
                    href={viewAllHref}
                    className="inline-flex items-center gap-2 rounded-full border-2 px-6 py-2 text-lg hover:shadow-sm"
                >
                    VER TODOS
                </a>
            </div>

            <div
                className="flex gap-6 overflow-x-auto pb-2 snap-x snap-mandatory
                   [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {PRODUCTS.map((p) => (
                    <div key={p.id} data-card>
                        <ProductCard {...p} variant="carousel" />
                    </div>
                ))}
            </div>
        </section>
    );
}
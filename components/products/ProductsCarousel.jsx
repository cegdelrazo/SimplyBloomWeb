"use client";

import ProductCard from "./ProductCard";

export default function ProductsCarousel({
                                             title = "PRODUCTOS",
                                             subtitle = "",
                                             viewAllHref = "#",
                                             products = [],
                                         }) {
    return (
        <section className="container py-14" id="productos">
            {/* Header */}
            <div className="flex items-end justify-between mb-6 gap-6">
                <div>
                    <h2 className="text-3xl md:text-4xl font-semibold">
                        {title}
                    </h2>

                    {subtitle && (
                        <p className="mt-1 text-sm md:text-base text-gray-500">
                            {subtitle}
                        </p>
                    )}
                </div>

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
                {products.map((p) => (
                    <div key={p.id} data-card>
                        <ProductCard {...p} variant="carousel" />
                    </div>
                ))}
            </div>
        </section>
    );
}
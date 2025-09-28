"use client";

import { useMemo, useState } from "react";
import ProductCard from "@/components/products/ProductCard";

export default function ProductsGridClient({ initialProducts = [], categories = [], pageSize = 12 }) {
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("all");
    const [sort, setSort] = useState("featured"); // featured | price-asc | price-desc | name
    const [visible, setVisible] = useState(pageSize);

    const filtered = useMemo(() => {
        let list = [...initialProducts];

        // Filtro por categoría
        if (category !== "all") {
            list = list.filter(p => (p.category || "").toLowerCase() === category.toLowerCase());
        }

        // Búsqueda
        if (query.trim()) {
            const q = query.trim().toLowerCase();
            list = list.filter(p =>
                [p.name, p.description, p.category]
                    .filter(Boolean)
                    .some(v => String(v).toLowerCase().includes(q))
            );
        }

        // Orden
        switch (sort) {
            case "price-asc":
                list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
                break;
            case "price-desc":
                list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
                break;
            case "name":
                list.sort((a, b) => String(a.name).localeCompare(String(b.name)));
                break;
            case "featured":
            default:
                // si tienes un campo "featured" o "rating", podrías usarlo aquí; por ahora no ordena
                break;
        }

        return list;
    }, [initialProducts, query, category, sort]);

    const toShow = filtered.slice(0, visible);
    const canLoadMore = visible < filtered.length;

    return (
        <>

            {/* Grid */}
            <div
                className="grid gap-6
                   grid-cols-2
                   md:grid-cols-3
                   lg:grid-cols-4"
            >
                {toShow.map((p) => (
                    <div key={p.id} data-card>
                        <ProductCard {...p} variant="grid" />
                    </div>
                ))}
            </div>

            {/* Vacío */}
            {filtered.length === 0 && (
                <div className="text-center py-16 text-gray-600">
                    No encontramos productos que coincidan con tu búsqueda.
                </div>
            )}

            {/* Ver más */}
            {canLoadMore && (
                <div className="flex justify-center mt-8">
                    <button
                        onClick={() => setVisible(v => v + pageSize)}
                        className="rounded-full border px-6 py-2 hover:bg-gray-50"
                    >
                        Ver más
                    </button>
                </div>
            )}
        </>
    );
}
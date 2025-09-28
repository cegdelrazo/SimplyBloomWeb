import ProductsGridClient from "./ProductsGridClient";
import { PRODUCTS } from "@/lib/products";

export const metadata = {
    title: "Todos los productos | SimplyBloom",
};

export default function ProductosPage() {
    // Si necesitas categorías, las deducimos del data
    const categories = Array.from(new Set(PRODUCTS.map(p => p.category).filter(Boolean))).sort();

    return (
        <main className="container mx-auto px-4 py-10">
            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                <div>
                    <h1 className="text-3xl md:text-4xl font-semibold">Todos los productos</h1>
                    <p className="text-gray-600 mt-1">Explora nuestro catálogo completo.</p>
                </div>
            </div>

            {/* Controles + Grid */}
            <ProductsGridClient
                initialProducts={PRODUCTS}
                categories={categories}
                pageSize={12}
            />
        </main>
    );
}
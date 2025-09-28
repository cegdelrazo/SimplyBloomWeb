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

            {/* Controles + Grid */}
            <ProductsGridClient
                initialProducts={PRODUCTS}
                categories={categories}
                pageSize={12}
            />
        </main>
    );
}
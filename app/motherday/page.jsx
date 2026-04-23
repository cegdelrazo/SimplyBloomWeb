import ProductsGridClient from "./ProductsGridClient";
import {PRODUCTS_MOTHER_DAY} from "@/lib/products";

export const metadata = {
    title: "Todos los productos | SimplyBloom",
};

export default function ProductosPage() {
    // Si necesitas categorías, las deducimos del data
    const categories = Array.from(new Set(PRODUCTS_MOTHER_DAY.map(p => p.category).filter(Boolean))).sort();

    return (
        <main className="container mx-auto px-4 py-10">
            <div className="text-center mb-10">
                <h1 className="text-3xl md:text-5xl font-serif italic text-neutral-800">
                    Mother’s Day
                </h1>
                <div className="mt-3 h-[2px] w-16 mx-auto bg-brand-pink/80" />
            </div>
            {/* Controles + Grid */}
            <ProductsGridClient
                initialProducts={PRODUCTS_MOTHER_DAY}
                categories={categories}
                pageSize={12}
            />
        </main>
    );
}

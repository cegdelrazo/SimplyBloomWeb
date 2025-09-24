"use client";

import { useGlobalContext } from "@/app/context/globalContext";
import EmptyCart from "@/app/cart/components/EmptyCart";
import CartItem from "@/app/cart/components/cartItem/CartItem";
import BuyerCard from "@/app/cart/components/buyer";
import CostSummary from "@/app/cart/components/summary";

export default function CartPage() {
    const {
        state: { cart },
    } = useGlobalContext();

    if (!cart.cartItems.length) return <EmptyCart />;

    return (
        <main className="container mx-auto px-4 py-8 md:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Columna izquierda: Productos */}
                <section className="lg:col-span-8">
                    <div className="rounded-2xl border bg-white p-6 shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Productos en el carrito
                        </h2>
                        <div className="mt-4 divide-y divide-gray-100">
                            {cart.cartItems.map((it) => (
                                <CartItem key={it.lineId} item={it} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Columna derecha: Comprador + Resumen */}
                <aside className="lg:col-span-4 lg:sticky lg:top-6 self-start space-y-6">
                    <div className="rounded-2xl border bg-white p-6 shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-900">Información del comprador</h2>
                        <div className="mt-4">
                            <BuyerCard />
                        </div>
                    </div>

                    <div className="rounded-2xl border bg-white p-6 shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-900">Resumen de costos</h2>
                        <div className="mt-4">
                            <CostSummary />
                        </div>
                    </div>
                </aside>
            </div>
        </main>
    );
}
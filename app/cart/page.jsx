"use client";

import { useGlobalContext } from "@/app/context/globalContext";
import EmptyCart from "@/app/cart/components/EmptyCart";
import CartListSimple from "@/app/cart/components/CartListSimple";
import BuyerInfoForm from "@/app/cart/components/BuyerInfoForm";
import CartSummary from "@/app/cart/components/CartSummary";
import { simulateShippingByCP } from "@/utils/shipping";

export default function CartPage() {
    const {
        state: { cart },
        dispatch,
    } = useGlobalContext();

    console.log(cart);

    const handleSaveAddress = (id, address) => {
        dispatch({ type: "SET_ITEM_ADDRESS", payload: { id, address } });
        const cp = address?.postalCode;
        if (/^\d{5}$/.test(cp)) {
            const res = simulateShippingByCP(cp);
            if (res.valid) {
                dispatch({ type: "SET_ITEM_SHIPPING", payload: { id, shipping: { cp, ...res } } });
            }
        } else {
            dispatch({ type: "SET_ITEM_SHIPPING", payload: { id, shipping: null } });
        }
    };

    const handleRemove = (id) => dispatch({ type: "REMOVE_ITEM_CART", payload: id });

    if (!cart.cartItems.length) return <EmptyCart />;

    return (
        <main className="container mx-auto px-4 py-6 md:py-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* IZQUIERDA: lista de productos */}
                <div className="lg:col-span-2">
                    <CartListSimple
                        items={cart.cartItems}
                        onSaveAddress={handleSaveAddress}
                        onRemove={handleRemove}
                    />
                </div>

                {/* DERECHA: sticky */}
                <div className="lg:col-span-1">
                    <aside className="lg:sticky lg:top-24 h-fit space-y-4">
                        <BuyerInfoForm />
                        <CartSummary items={cart.cartItems} />
                    </aside>
                </div>
            </div>
        </main>
    );
}
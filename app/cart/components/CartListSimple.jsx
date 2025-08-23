"use client";

import CartItem from "./CartItem";

export default function CartListSimple({ items, onSaveAddress, onRemove }) {
    return (
        <section className="space-y-4">
            {items.map((it) => (
                <CartItem
                    key={it.id}
                    item={it}
                    onSaveAddress={onSaveAddress}
                    onRemove={onRemove}
                />
            ))}
        </section>
    );
}
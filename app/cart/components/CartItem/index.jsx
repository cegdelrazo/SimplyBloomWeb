"use client";

import { useMemo } from "react";
import ProductHeader from "./ProductHeader";
import OptionsList from "./OptionsList";
import AddressCard from "./AddressCard";
import ShippingInfo from "./ShippingInfo";
import Subtotal from "./Subtotal";

export default function CartItem({ item, onSaveAddress, onRemove }) {
    const { id, name, price, quantity = 1, options, image, deliveryAddress, shipping } = item;

    const subtotal = useMemo(() => price * quantity, [price, quantity]);

    return (
        <article className="flex flex-col gap-4 p-4 md:p-5 rounded-2xl border bg-white shadow-sm hover:shadow-md transition">
            {/* Top: imagen + título + precio + eliminar */}
            <ProductHeader
                id={id}
                name={name}
                price={price}
                image={image}
                onRemove={onRemove}
            />

            {/* Opciones del ramo */}
            <OptionsList options={options} />

            {/* Dirección de entrega */}
            <AddressCard
                id={id}
                deliveryAddress={deliveryAddress}
                onSaveAddress={onSaveAddress}
            />

            {/* Envío por ítem */}
            <ShippingInfo shipping={shipping} />

            {/* Subtotal */}
            <Subtotal amount={subtotal} />
        </article>
    );
}
// app/cart/EmptyCart.tsx
"use client";

import Link from "next/link";
import Image from "next/image";

export default function EmptyCart() {
    return (
        <main className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-fadeIn">
            {/* Imagen */}
            <Image
                src="/media/cartEmpty.png"
                alt="Carrito vacío"
                width={220}
                height={220}
                priority
                className="mb-6 drop-shadow-lg"
            />

            {/* Texto */}
            <h2 className="text-2xl md:text-3xl font-serif font-semibold text-gray-800 mb-2">
                Tu carrito está vacío
            </h2>
            <p className="text-gray-600 mb-8 max-w-md">
                Aún no has agregado ningún producto. Explora nuestra colección y encuentra algo especial ✨
            </p>

            {/* Botón */}
            <Link
                href="/#productos"
                className="inline-flex items-center gap-2 rounded-full bg-brand-pink px-8 py-2 text-white font-semibold
                       shadow-md hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-pink"
            >
                Explorar productos
                <span aria-hidden className="text-xl">→</span>
            </Link>
        </main>
    );
}
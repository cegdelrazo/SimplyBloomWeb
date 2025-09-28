// app/cart/EmptyCart.tsx
"use client";

import Link from "next/link";

export default function EmptyCart() {
    return (
        <main className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-fadeIn">
            {/* Icono carrito (SVG) */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-40 h-40 mb-6 drop-shadow-lg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="black"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M2.25 3h1.386a1.125 1.125 0 0 1 1.1.86l.383 1.72m0 0L6.75 14.25h10.5l1.64-7.37a1.125 1.125 0 0 0-1.099-1.38H5.119m0 0L4.5 6.75m3 14.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm9 0a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                />
            </svg>

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
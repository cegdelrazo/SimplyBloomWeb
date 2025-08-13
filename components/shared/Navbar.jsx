// app/components/shared/Navbar

"use client";

import { useState } from "react";

export default function Navbar() {
    const [open, setOpen] = useState(false);

    return (
        <header className="fixed top-0 inset-x-0 z-30 bg-white/80 backdrop-blur border-b">
            {/* Barra principal */}
            <div className="mx-auto max-w-7xl h-16 px-4 flex items-center justify-between">
                {/* Izquierda: links (desktop) / menu button (mobile) */}
                <div className="flex-1">
                    {/* Botón hamburguesa: solo móvil */}
                    <button
                        className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border hover:bg-gray-50"
                        aria-label="Abrir menú"
                        onClick={() => setOpen((v) => !v)}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeWidth="1.5" strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
                        </svg>
                    </button>

                    {/* Links: sólo desktop */}
                    <nav className="hidden md:flex items-center gap-10">
                        <a href="#productos" className="text-lg font-serif hover:opacity-70 transition">
                            HAZ TU PEDIDO
                        </a>
                    </nav>
                </div>

                {/* Centro: logo */}
                <a href="/" className="inline-flex items-center">
                    <img src="/logo.svg" alt="SimplyBloom" className="h-10 md:h-14 w-auto" />
                </a>

                {/* Derecha: link (desktop) + carrito */}
                <div className="flex-1 flex items-center justify-end gap-6">
                    {/* Link derecho: sólo desktop */}
                    <a href="/eventos" className="hidden md:inline text-lg font-serif hover:opacity-70 transition">
                        EVENTO/TALLER
                    </a>

                    {/* Carrito */}
                    <a
                        href="/cart"
                        className="inline-flex items-center justify-center h-9 w-9 rounded-full border hover:bg-gray-50"
                        aria-label="Carrito"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"
                             viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                  d="M2.25 3h1.386a1.125 1.125 0 0 1 1.1.86l.383 1.72m0 0L6.75 14.25h10.5l1.64-7.37a1.125 1.125 0 0 0-1.099-1.38H5.119m0 0L4.5 6.75m3 14.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm9 0a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" />
                        </svg>
                    </a>
                </div>
            </div>

            {/* Menú desplegable móvil */}
            {open && (
                <div className="md:hidden border-t bg-white/95 backdrop-blur">
                    <nav className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-2">
                        <a
                            href="#productos"
                            className="py-2 text-base font-serif hover:opacity-70"
                            onClick={() => setOpen(false)}
                        >
                            HAZ TU PEDIDO
                        </a>
                        <a
                            href="/events"
                            className="py-2 text-base font-serif hover:opacity-70"
                            onClick={() => setOpen(false)}
                        >
                            EVENTO/TALLER
                        </a>
                    </nav>
                </div>
            )}
        </header>
    );
}
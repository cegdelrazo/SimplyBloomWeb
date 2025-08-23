"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddressPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            router.push("/checkout"); // siguiente paso
        }, 500);
    };

    return (
        <main className="container py-6 md:py-10">
            <nav className="text-sm text-gray-500 mb-2">
                <Link href="/">Inicio</Link> <span className="mx-1">/</span> <Link href="/cart">Carrito</Link>{" "}
                <span className="mx-1">/</span> <span>Dirección</span>
            </nav>

            <h1 className="text-2xl md:text-3xl font-bold mb-4">Dirección de entrega</h1>

            <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl border bg-white p-4 sm:p-6">
                    <h2 className="text-lg font-semibold mb-4">Datos del destinatario</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Nombre completo</label>
                            <input className="w-full rounded-md border px-3 py-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Teléfono</label>
                            <input className="w-full rounded-md border px-3 py-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Correo electrónico</label>
                            <input className="w-full rounded-md border px-3 py-2" />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border bg-white p-4 sm:p-6">
                    <h2 className="text-lg font-semibold mb-4">Dirección</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Calle y número</label>
                            <input className="w-full rounded-md border px-3 py-2" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Colonia</label>
                                <input className="w-full rounded-md border px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Ciudad</label>
                                <input className="w-full rounded-md border px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">C.P.</label>
                                <input className="w-full rounded-md border px-3 py-2" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Referencias</label>
                            <textarea rows={3} className="w-full rounded-md border px-3 py-2" />
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-3">
                        <Link href="/cart" className="rounded-full border px-5 py-2 text-sm hover:bg-gray-50">
                            Volver al carrito
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-full border px-5 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
                        >
                            {saving ? "Guardando..." : "Continuar"}
                        </button>
                    </div>
                </div>
            </form>
        </main>
    );
}
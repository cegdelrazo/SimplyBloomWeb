// app/success/page.js
import { Suspense } from "react";
import SuccessClient from "./SuccessClient";

export const dynamic = "force-dynamic"; // evita prerender estático (recomendado aquí)
export const metadata = { title: "Success" }; // NADA de themeColor aquí

export default function SuccessPage() {
    return (
        <Suspense fallback={<div className="max-w-4xl mx-auto p-8">Cargando…</div>}>
            <SuccessClient />
        </Suspense>
    );
}
// app/success/page.js
import { Suspense } from "react";
import SuccessClient from "./SuccessClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Success" };

export default function SuccessPage() {
    return (
        <Suspense fallback={<div className="max-w-4xl mx-auto p-8">Cargando…</div>}>
            <SuccessClient />
        </Suspense>
    );
}
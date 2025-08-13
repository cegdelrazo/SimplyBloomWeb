// components/bouquet/OrderForm.jsx
"use client";

export default function OrderForm({ disabled, helper, total }) {
    return (
        <form className={`mt-3 space-y-4 ${disabled ? "opacity-60 pointer-events-none" : ""}`}>
            {helper && <div className="text-sm text-gray-600">{helper}</div>}

            <div>
                <label className="block text-sm font-medium mb-1">Ciudad</label>
                <select className="w-full rounded-md border px-3 py-2 bg-white">
                    <option>CDMX</option>
                    <option>Guadalajara</option>
                    <option>Monterrey</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Fecha de entrega</label>
                <input type="date" className="w-full rounded-md border px-3 py-2" />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Título / Subtítulo</label>
                <input type="text" placeholder="Escribe tu texto" className="w-full rounded-md border px-3 py-2" />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Firma / Mensaje</label>
                <textarea rows={3} className="w-full rounded-md border px-3 py-2" />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Sube tus imágenes (máx. 4)</label>
                <input type="file" accept="image/*" multiple className="block w-full text-sm" />
            </div>

            <div className="pt-2 flex items-center justify-between">
                <span className="text-sm text-gray-600">Total</span>
                <span className="text-xl font-semibold">
          ${total} <span className="text-xs">MXN</span>
        </span>
            </div>

            {/* Solo desktop */}
            <button
                type="button"
                className="mt-2 hidden md:inline-flex items-center justify-center rounded-full border px-6 py-2 font-medium hover:bg-gray-50"
                disabled={disabled}
            >
                Agregar al carrito
            </button>
        </form>
    );
}
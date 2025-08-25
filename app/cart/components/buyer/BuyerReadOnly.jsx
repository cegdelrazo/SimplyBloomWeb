"use client";

function Info({ label, value }) {
    return (
        <div>
            <span className="text-[11px] text-gray-500">{label}: </span>
            <span className="font-medium text-gray-900">{value || "—"}</span>
        </div>
    );
}

export default function BuyerReadOnly({ values, onEdit }) {
    const { fullName, phone, email } = values || {};
    return (
        <div className="space-y-2 text-sm text-gray-800">
            <div className="flex flex-wrap gap-x-6 gap-y-1">
                <Info label="Nombre" value={fullName} />
                <Info label="Teléfono" value={phone} />
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1">
                <Info label="Correo" value={email} />
            </div>

            <button
                type="button"
                onClick={onEdit}
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-gray-900"
            >
                ✎ Editar datos
            </button>
        </div>
    );
}
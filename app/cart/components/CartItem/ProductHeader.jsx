import Image from "next/image";

export default function ProductHeader({ id, name, price, image, onRemove }) {
    return (
        <div className="flex gap-4">
            <div className="relative h-28 w-28 shrink-0">
                <Image src={image} alt={name} fill className="object-cover rounded-lg" />
            </div>

            <div className="flex-1">
                <header className="flex items-start justify-between gap-3">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
                        <p className="mt-0.5 text-gray-900 text-xl font-bold">
                            {formatMXN(price)}
                        </p>
                    </div>
                    <button
                        onClick={() => onRemove?.(id)}
                        className="text-sm font-medium text-red-600 hover:text-red-700"
                    >
                        Eliminar
                    </button>
                </header>
            </div>
        </div>
    );
}

function formatMXN(n) {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);
}
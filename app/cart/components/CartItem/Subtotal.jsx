export default function Subtotal({ amount = 0 }) {
    return (
        <div className="text-sm text-gray-500">
            Subtotal:{" "}
            <strong className="text-gray-800">{formatMXN(amount)}</strong>
        </div>
    );
}

function formatMXN(n) {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n || 0);
}
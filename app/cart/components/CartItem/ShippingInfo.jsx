export default function ShippingInfo({ shipping }) {
    return (
        <div className="rounded-xl border bg-white p-3">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-800">Envío de este producto</h4>
                {shipping?.valid ? (
                    <span className="text-xs text-gray-600">
            {shipping.zone} • {shipping.etaDays}
          </span>
                ) : null}
            </div>

            {shipping?.valid ? (
                <>
                    <p className="mt-2 text-xs text-gray-600">{shipping.note}</p>
                    <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-gray-600">Costo de envío</span>
                        <span className="text-base font-semibold text-gray-900">
              {formatMXN(shipping.cost)}
            </span>
                    </div>
                </>
            ) : (
                <p className="mt-2 text-xs text-red-500">
                    Agrega un CP en la dirección para calcular envío.
                </p>
            )}
        </div>
    );
}

function formatMXN(n) {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n || 0);
}
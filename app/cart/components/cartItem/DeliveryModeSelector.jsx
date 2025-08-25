"use client";

export default function DeliveryModeSelector({ value = "pickup", pickupAddress, onChange }) {
    return (
        <div>
            <p className="mb-2 text-xs font-semibold text-gray-900">Modo de entrega</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Pickup */}
                <button
                    type="button"
                    onClick={() => onChange?.("pickup")}
                    className={`text-left rounded-2xl border p-4 transition hover:shadow-sm ${
                        value === "pickup" ? "border-gray-900 bg-gray-900/5" : "border-gray-200 bg-white"
                    }`}
                >
                    <div className="flex items-start gap-3">
                        <div
                            className={`mt-0.5 h-5 w-5 rounded-full border flex items-center justify-center ${
                                value === "pickup" ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300 text-gray-500"
                            }`}
                        >
                            ✓
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-900">Pickup</div>
                            <div className="mt-1 text-xs text-gray-600">{pickupAddress}</div>
                        </div>
                    </div>
                </button>

                {/* Delivery */}
                <button
                    type="button"
                    onClick={() => onChange?.("delivery")}
                    className={`text-left rounded-2xl border p-4 transition hover:shadow-sm ${
                        value === "delivery" ? "border-gray-900 bg-gray-900/5" : "border-gray-200 bg-white"
                    }`}
                >
                    <div className="flex items-start gap-3">
                        <div
                            className={`mt-0.5 h-5 w-5 rounded-full border flex items-center justify-center ${
                                value === "delivery" ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300 text-gray-500"
                            }`}
                        >
                            ✓
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-900">Entrega a domicilio</div>
                            <div className="mt-1 text-xs text-gray-600">Primero ingresa el C.P. y luego la dirección.</div>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );
}
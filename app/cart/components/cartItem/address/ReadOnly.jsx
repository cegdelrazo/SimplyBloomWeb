"use client";

const INT_TOKEN = " Int ";

function parseExtNumber(stored = "") {
    const s = String(stored || "").trim();
    if (!s) return { exterior: "", interior: "" };

    const idx = s.indexOf(INT_TOKEN);
    if (idx === -1) return { exterior: s, interior: "" };

    const exterior = s.slice(0, idx).trim();
    const interior = s.slice(idx + INT_TOKEN.length).trim();
    return { exterior, interior };
}

function Info({ label, value }) {
    return (
        <div>
            <span className="text-[11px] text-gray-500">{label}: </span>
            <span className="font-medium text-gray-900">{value || "—"}</span>
        </div>
    );
}

export default function ReadOnly({ values, onEdit, shipping }) {
    const { cp, street, extNumber, neighborhood, fullName, phone } = values || {};
    const { exterior, interior } = parseExtNumber(extNumber);

    return (
        <div className="space-y-3 text-sm text-gray-800">
            {/* Contacto */}
            <div>
                <p className="text-xs font-semibold text-gray-900 mb-1">Contacto</p>
                <div className="flex flex-wrap gap-x-6 gap-y-1">
                    <Info label="Quién recibe" value={fullName} />
                    <Info label="Teléfono" value={phone} />
                </div>
            </div>

            {/* Ubicación */}
            <div>
                <p className="text-xs font-semibold text-gray-900 mb-1">Ubicación</p>
                <div className="flex flex-wrap gap-3 items-center">
                    <Info label="C.P." value={cp} />
                    {shipping?.valid && (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] text-emerald-800 border border-emerald-200">
              Envío ${shipping.cost}
            </span>
                    )}
                </div>
                {!shipping?.valid && cp?.length === 5 && (
                    <div className="mt-1 text-[11px] text-amber-700">
                        {shipping?.note || "C.P. inválido"}
                    </div>
                )}
            </div>

            {/* Dirección */}
            <div>
                <p className="text-xs font-semibold text-gray-900 mb-1">Dirección</p>
                <div className="flex flex-wrap gap-x-6 gap-y-1">
                    <Info label="Calle" value={street} />
                    <Info label="No. Ext." value={exterior || "—"} />
                    <Info label="No. Int." value={interior || "—"} />
                    <Info label="Colonia" value={neighborhood} />
                </div>
            </div>

            <button
                type="button"
                onClick={onEdit}
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-gray-900"
            >
                ✎ Editar dirección
            </button>
        </div>
    );
}
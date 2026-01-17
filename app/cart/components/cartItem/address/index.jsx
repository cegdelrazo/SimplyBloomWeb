"use client";

import { useMemo, useState, useEffect } from "react";
import EditForm from "./EditForm";
import ReadOnly from "./ReadOnly";

const digitsOnly = (s = "") => String(s).replace(/\D/g, "");

function isValidStoredPhone(phone) {
    const d = digitsOnly(phone);

    // MX: 52 + 10 dígitos
    if (d.startsWith("52")) return d.length === 12;

    // US/CA: 1 + 10 dígitos
    if (d.startsWith("1")) return d.length === 11;

    // Si todavía tienes datos viejos (10 dígitos), decide:
    // a) aceptarlos para no forzar edición, o
    // b) obligar a editar para migrarlos.
    // Yo recomiendo A para no molestar al usuario:
    if (d.length === 10) return true;

    // fallback razonable
    return d.length >= 8 && d.length <= 15;
}

export default function AddressForm({ value = {}, onChange, onCpChange, shipping }) {
    const initialValues = useMemo(
        () => ({
            cp: value.cp || "",
            street: value.street || "",
            extNumber: value.extNumber || "",
            neighborhood: value.neighborhood || "",
            fullName: value.fullName || "",
            phone: value.phone || "",
        }),
        [value]
    );

    const shouldStartEditing = useMemo(() => {
        const { cp, street, neighborhood, fullName, phone } = initialValues;
        const cpOk = cp && /^\d{5}$/.test(cp);
        const phoneOk = phone && isValidStoredPhone(phone);

        return !(cpOk && street && neighborhood && fullName && phoneOk);
    }, [initialValues]);

    const [editMode, setEditMode] = useState(shouldStartEditing);

    useEffect(() => {
        setEditMode(shouldStartEditing);
    }, [shouldStartEditing]);

    return (
        <div className="rounded-xl border border-gray-200 p-3 md:p-4">
            {editMode ? (
                <EditForm
                    initialValues={initialValues}
                    isFirstTime={shouldStartEditing}
                    onCancel={() => setEditMode(false)}
                    onSaved={(vals) => {
                        onChange?.(vals);
                        onCpChange?.(vals.cp);
                        setEditMode(false);
                    }}
                    onPartialChange={(patch) => onChange?.({ ...initialValues, ...patch })}
                    onCpChange={onCpChange}
                    shipping={shipping}
                />
            ) : (
                <ReadOnly values={initialValues} onEdit={() => setEditMode(true)} shipping={shipping} />
            )}
        </div>
    );
}
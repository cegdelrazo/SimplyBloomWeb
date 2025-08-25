"use client";

import { useMemo, useState, useEffect } from "react";
import EditForm from "./EditForm";
import ReadOnly from "./ReadOnly";

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
        const phoneOk = phone && /^\d{10}$/.test(phone.replace(/\D/g, ""));
        return !(cpOk && street && neighborhood && fullName && phoneOk);
    }, [initialValues]);

    const [editMode, setEditMode] = useState(shouldStartEditing);

    useEffect(() => { setEditMode(shouldStartEditing); }, [shouldStartEditing]);

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
                <ReadOnly
                    values={initialValues}
                    onEdit={() => setEditMode(true)}
                    shipping={shipping}
                />
            )}
        </div>
    );
}
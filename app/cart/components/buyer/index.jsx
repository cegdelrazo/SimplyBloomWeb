"use client";

import { useMemo, useState, useEffect } from "react";
import { useGlobalContext } from "@/app/context/globalContext";
import BuyerEditForm from "./BuyerEditForm";
import BuyerReadOnly from "./BuyerReadOnly";

export default function BuyerCard() {
    const {
        state: { cart },
        dispatch,
    } = useGlobalContext();

    const initial = useMemo(() => {
        const fullName = [cart.buyer.firstName, cart.buyer.lastName].filter(Boolean).join(" ");
        return {
            fullName,
            phone: cart.buyer.phone || "",
            email: cart.buyer.email || "",
        };
    }, [cart.buyer]);

    // Si faltan datos necesarios, inicia en edición
    const shouldStartEditing = useMemo(() => {
        const phoneOk = initial.phone && initial.phone.replace(/\D/g, "").length === 10;
        return !(initial.fullName && phoneOk && initial.email);
    }, [initial]);

    const [editMode, setEditMode] = useState(shouldStartEditing);

    useEffect(() => {
        setEditMode(shouldStartEditing);
    }, [shouldStartEditing]);

    const handleSave = (vals) => {
        const parts = (vals.fullName || "").trim().split(/\s+/);
        const firstName = parts.length > 1 ? parts.slice(0, -1).join(" ") : (parts[0] || "");
        const lastName = parts.length > 1 ? parts.slice(-1).join(" ") : "";

        dispatch({
            type: "SET_BUYER",
            payload: {
                firstName,
                lastName,
                phone: vals.phone.replace(/\D/g, ""),
                email: vals.email.trim(),
            },
        });
        setEditMode(false);
    };

    return editMode ? (
        <BuyerEditForm
            initialValues={initial}
            isFirstTime={shouldStartEditing}
            onCancel={() => setEditMode(false)}
            onSaved={handleSave}
        />
    ) : (
        <BuyerReadOnly values={initial} onEdit={() => setEditMode(true)} />
    );
}
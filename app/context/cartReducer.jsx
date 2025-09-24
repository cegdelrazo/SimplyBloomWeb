"use client";

import {safeUUID} from "@/utils/ids";

export const cartInitialState = {
    cartItems: [],
    buyer: {
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
    },
};

function revokeItemPreviews(item) {
    try {
        const imgs = item?.images || [];
        for (const m of imgs) {
            if (m?.previewUrl) {
                URL.revokeObjectURL(m.previewUrl);
            }
        }
    } catch (_) {}
}

export const cartReducer = (state, action) => {
    switch (action.type) {
        case "ADD_ITEM_CART": {
            const newItem = {
                ...action.payload,
                lineId: safeUUID(),
            };
            return { ...state, cartItems: [...state.cartItems, newItem] };
        }

        case "REMOVE_ITEM_CART": {
            const lineId = action.payload;
            const item = state.cartItems.find((it) => it.lineId === lineId);
            if (item) revokeItemPreviews(item);

            return {
                ...state,
                cartItems: state.cartItems.filter((it) => it.lineId !== lineId),
            };
        }

        case "SET_ITEM_ADDRESS": {
            const { lineId, address } = action.payload;
            return {
                ...state,
                cartItems: state.cartItems.map((it) =>
                    it.lineId === lineId ? { ...it, deliveryAddress: address } : it
                ),
            };
        }

        case "SET_ITEM_SHIPPING": {
            const { lineId, shipping } = action.payload;
            return {
                ...state,
                cartItems: state.cartItems.map((it) =>
                    it.lineId === lineId ? { ...it, shipping } : it
                ),
            };
        }

        case "SET_BUYER": {
            return {
                ...state,
                buyer: { ...state.buyer, ...(action.payload || {}) },
            };
        }

        case "SET_ITEM_IMAGES": {
            const { lineId, images } = action.payload;
            const prev = state.cartItems.find((it) => it.lineId === lineId);
            if (prev) revokeItemPreviews(prev);

            return {
                ...state,
                cartItems: state.cartItems.map((it) =>
                    it.lineId === lineId ? { ...it, images: images || [] } : it
                ),
            };
        }

        case "CLEAR_CART": {
            for (const it of state.cartItems) revokeItemPreviews(it);
            return { ...state, cartItems: [] };
        }

        case "SET_CART":
            return { ...state, cartItems: action.payload };

        default:
            return state;
    }
};
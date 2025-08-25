// store/cartReducer.js
"use client";

export const cartInitialState = {
    cartItems: [],
    buyer: {
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
    },
};

export const cartReducer = (state, action) => {
    switch (action.type) {
        case "ADD_ITEM_CART":
            const newItem = {
                ...action.payload,
                lineId: crypto.randomUUID(),
            };
            return { ...state, cartItems: [...state.cartItems, newItem] };

        case "REMOVE_ITEM_CART":
            return {
                ...state,
                cartItems: state.cartItems.filter((it) => it.lineId !== action.payload),
            };

        case "SET_ITEM_ADDRESS": {
            const { lineId, address } = action.payload;
            return {
                ...state,
                cartItems: state.cartItems.map((it) =>
                    it.lineId === lineId ? { ...it, deliveryAddress: address } : it
                ),
            };
        }

        case "SET_BUYER": {
            return {
                ...state,
                buyer: { ...state.buyer, ...(action.payload || {}) },
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

        case "CLEAR_CART":
            return { ...state, cartItems: [] };

        case "SET_CART":
            return { ...state, cartItems: action.payload };

        default:
            return state;
    }
};
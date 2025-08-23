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
            return { ...state, cartItems: [...state.cartItems, action.payload] };

        case "REMOVE_ITEM_CART":
            return { ...state, cartItems: state.cartItems.filter((it) => it.id !== action.payload) };

        case "SET_ITEM_ADDRESS": {
            const { id, address } = action.payload; // address: {fullName, street, ...}
            return {
                ...state,
                cartItems: state.cartItems.map((it) =>
                    it.id === id ? { ...it, deliveryAddress: address } : it
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
            const { id, shipping } = action.payload; // shipping: {cp, zone, cost, etaDays, note}
            return {
                ...state,
                cartItems: state.cartItems.map((it) =>
                    it.id === id ? { ...it, shipping } : it
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
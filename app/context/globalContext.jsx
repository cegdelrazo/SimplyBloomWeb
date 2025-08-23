"use client";

import React, {createContext, useContext, useReducer} from 'react';

import { cartInitialState, cartReducer } from "./cartReducer"
import { combineReducers } from "@/app/context/combineReducers";

const GlobalContext = createContext({});


const rootReducer = combineReducers({
    cart: cartReducer,
});

const initialState = {
    cart: cartInitialState,
};

export const GlobalProvider = ({children}) => {
    const [state, dispatch] = useReducer(rootReducer, initialState);

    return (
        <GlobalContext.Provider value={{state, dispatch}}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => useContext(GlobalContext);

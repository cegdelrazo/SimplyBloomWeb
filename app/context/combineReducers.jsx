export const combineReducers = reducers => {
    return (state, action) => {
        return Object.keys(reducers).reduce(
            (acc, prop) => ({
                ...acc,
                [prop]: reducers[prop](acc[prop], action),
            }),
            state,
        );
    };
};

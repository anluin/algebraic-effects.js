let effectsHandler = (effect) => {
    throw new Error(`unhandled effect: "${effect}"`);
};

export const effects = new Proxy({}, {
    get: (...[, effect]) => (...args) => effectsHandler(effect, args),
});

export const handleEffects = async (callback, effectHandlers) => {
    const previousEffectsHandler = effectsHandler;

    effectsHandler = (effect, args) => {
        if (effectHandlers[effect]) {
            return effectHandlers[effect](...args);
        } else {
            return previousEffectsHandler(effect, args);
        }
    };

    await callback();

    effectsHandler = previousEffectsHandler;
};

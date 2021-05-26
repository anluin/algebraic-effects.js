// Some boilerplate to be able to use "instanceof"...
class Perform {
    constructor(data) {
        this.data = data;
    }
}

class Resume {
    constructor(data) {
        this.data = data;
    }
}

class Result {
    constructor(data) {
        this.data = data;
    }
}

class Effect {
    constructor() {
    }
}

export const createEffect = (name) => {
    return Object.assign(class extends Effect { }, {
        toString() {
            return name;
        }
    });
};

// Some workarounds for the non-existent language support...
export const perform = (value) => new Perform(value);
export const resume = (value) => new Resume(value);
export const result = (value) => new Result(value);

export const handleEffects = ((currentEffectHandler) => (callback, handler) => {
    const previousHandler = currentEffectHandler;

    currentEffectHandler = (effect) => {
        let result = handler(effect);

        if (result instanceof Resume) {
            return result.data;
        } else {
            return previousHandler(effect);
        }
    };

    let result = callback();

    currentEffectHandler = previousHandler;

    return result;
})((effect) => {
    throw new Error(`unhandeld effect: ${effect}`);
});

export const withEffects = (generator) => (...args) => ((generator) => {
    for (let message = generator.next(); !message.done;) {
        if (message.value instanceof Perform) {
            const effect = message.value.data;

            message = generator.next(currentEffectHandler(
                effect.prototype instanceof Effect
                    ? new effect()
                    : effect
            ));
        } else if (message.value instanceof Result) {
            return generator.return(message.value.data).value;
        } else {
            throw new Error(`something went wrong`);
        }
    }
})(generator(...args));

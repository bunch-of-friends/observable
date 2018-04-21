import { Observer } from './observer';

export interface Subject<T> {
    registerObserver(observer: Observer<T>, owner: Object): Observer<T>;
    unregisterObserver(observer: Observer<T>): void;
    unregisterObserversOfOwner(owner: Object): void;
    unregisterAllObservers(): void;
    notifyObservers(newState?: T): Promise<void>;
    getCurrentState(): T;
}

export function createSubject<T>(options?: { initialState?: T }): Subject<T> {
    let currentState = (!options || options.initialState === undefined) ? null : options.initialState;
    let registeredObservers = new Array<{ observer: Observer<T>, owner: Object }>();

    return {
        registerObserver: (observer: Observer<T>, owner: Object) => {
            if (observer) {
                registeredObservers.push({ observer, owner });
            }

            return observer;
        },
        unregisterObserver: (observer: Observer<T>) => {
            registeredObservers.forEach((item, index) => {
                if (item.observer !== observer) {
                    return;
                }

                registeredObservers.splice(index, 1);
            });
        },
        unregisterObserversOfOwner: (owner: Object) => {
            registeredObservers = registeredObservers.filter(item => item.owner !== owner);
        },
        unregisterAllObservers: () => {
            registeredObservers = [];
        },
        notifyObservers: (newState?: T) => {
            const previousState = currentState;
            currentState = newState;

            const promises = new Array<Promise<void>>();
            registeredObservers.forEach(item => {
                const returned = item.observer(currentState, previousState);
                if (returned && typeof returned.then === 'function' && typeof returned.catch === 'function') {
                    promises.push(returned);
                }
            });

            return Promise.all(promises)
                .then(() => Promise.resolve())
                .catch(() => Promise.resolve());
        },
        getCurrentState: () => {
            return currentState;
        }
    };
}

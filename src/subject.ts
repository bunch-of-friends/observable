import { Observer } from './observer';

export interface Subject<T> {
    registerObserver(observer: Observer<T>, owner: Object): Observer<T>;
    unregisterObserver(observer: Observer<T>): void;
    unregisterObserversOfOwner(owner: Object): void;
    unregisterAllObservers(): void;
    notifyObservers(newState?: T): void;
    getCurrentState(): T;
}

export function createSubject<T>(options?: { shouldNotifyOnlyIfNewStateDiffers?: boolean, initialState?: T }) {
    const shouldNotifyOnlyIfNewStateDiffers = options ? (options.shouldNotifyOnlyIfNewStateDiffers || false) : false;
    let currentState = options ? (options.initialState || null) : null;
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
            if (shouldNotifyOnlyIfNewStateDiffers && newState === currentState) {
                return;
            }

            registeredObservers.forEach(item => item.observer(newState, currentState));
            currentState = newState;
        },
        getCurrentState: () => {
            return currentState;
        }
    };
}

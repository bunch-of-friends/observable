import { Observer } from './observer';
import { Subject } from './subject';

export interface Observable<T> {
    getCurrentState: () => T;
    register: (observer: Observer<T>) => Observer<T>;
    unregister: (observer: Observer<T>) => void;
    unregisterAllObservers: () => void;
}

export function createObservable<T>(subject: Subject<T>): Observable<T> {
    const observerOwner = {};
    return {
        getCurrentState: () => subject.getCurrentState(),
        register: (observer: Observer<T>) => subject.registerObserver(observer, observerOwner),
        unregister: (observer: Observer<T>) => subject.unregisterObserver(observer),
        unregisterAllObservers: () => subject.unregisterObserversOfOwner(observerOwner)
    };
}

export function createObservableForValue<T>(subject: Subject<T>, value: T): Observable<void> {
    const observerOwner = {};
    const registeredObserversMap = new Array<{ registeredObserver: Observer<T>, exactValueObserver: Observer<void> }>();

    function registerExactValueObserver(exactValueObserver: Observer<void>) {
        return subject.registerObserver((newValue, oldValue) => {
            if (newValue === value) {
                exactValueObserver(null, null);
            }
        }, observerOwner);
    }

    return {
        getCurrentState: () => undefined,
        register: (exactValueObserver: Observer<void>) => {
            const registeredObserver = registerExactValueObserver(exactValueObserver);
            registeredObserversMap.push({ registeredObserver, exactValueObserver });
            return exactValueObserver;
        },
        unregister: (exactValueObserver: Observer<void>) => {
            const registeredObservers = registeredObserversMap.filter(x => x.exactValueObserver === exactValueObserver);
            if (registeredObservers) {
                registeredObservers.forEach(x => subject.unregisterObserver(x.registeredObserver));
            }
        },
        unregisterAllObservers: () => subject.unregisterObserversOfOwner(observerOwner)
    };
}

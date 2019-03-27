import { Observer } from "./observer";
import { Subject } from "./subject";

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
    register: (observer: Observer<T>) =>
      subject.registerObserver(observer, observerOwner),
    unregister: (observer: Observer<T>) => subject.unregisterObserver(observer),
    unregisterAllObservers: () =>
      subject.unregisterObserversOfOwner(observerOwner)
  };
}

export function createObservableForValue<T>(
  subject: Subject<T>,
  value: T
): Observable<void> {
  const observerOwner = {};
  let registeredObserversMap = new Array<{
    registeredObserver: Observer<T>;
    exactValueObserver: Observer<void>;
  }>();

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
      registeredObserversMap = registeredObserversMap.filter(
        (x) => {
          if (x.exactValueObserver === exactValueObserver) {
            subject.unregisterObserver(x.registeredObserver);
            return false;
          }
          return true;
        }
      );
    },
    unregisterAllObservers: () =>
      subject.unregisterObserversOfOwner(observerOwner)
  };
}

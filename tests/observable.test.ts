import { Subject, createSubject } from '../src/subject';
import { Observer } from '../src/observer';
import { Observable, createObservable, createObservableForValue } from '../src/observable';

describe('Observable', () => {
    let observable: Observable<any>;
    let subject: Subject<any>;

    beforeEach(() => {
        subject = createSubject<any>();
        observable = createObservable(subject);
    });

    it('should notify registered observers', () => {
        const observer1 = jest.fn();
        const observer2 = jest.fn();
        observable.register(observer1);
        observable.register(observer2);
        subject.notifyObservers('test');

        expect(observer1).toBeCalled();
        expect(observer2).toBeCalled();
    });

    it('should unregistered observers', () => {
        const observer = jest.fn();
        observable.register(observer);
        subject.notifyObservers('test');

        observer.mockReset();

        observable.unregister(observer);
        subject.notifyObservers('test2');

        expect(observer).not.toBeCalled();
    });

    it('should unregister all observers', () => {
        const observer1 = jest.fn();
        const observer2 = jest.fn();
        observable.register(observer1);
        observable.register(observer2);
        subject.notifyObservers('test');

        observer1.mockReset();
        observer2.mockReset();

        observable.unregisterAll();
        subject.notifyObservers('test2');

        expect(observer1).not.toBeCalled();
        expect(observer2).not.toBeCalled();
    });
});

describe('ObservableForValue', () => {
    let observable: Observable<void>;
    let subject: Subject<any>;

    beforeEach(() => {
        subject = createSubject<any>();
        observable = createObservableForValue(subject, 1);
    });

    it('should notify only if state changed to specific value', () => {
        const observer = jest.fn();
        observable.register(observer);

        subject.notifyObservers(2);
        subject.notifyObservers(3);
        subject.notifyObservers(false);
        subject.notifyObservers(true);

        expect(observer).not.toHaveBeenCalled();

        subject.notifyObservers(1);

        expect(observer).toHaveBeenCalled();
    });

    it('should unregistered observers', () => {
        const observer1 = jest.fn();
        const observer2 = jest.fn();
        const returnedObserver1 = observable.register(observer1);
        subject.notifyObservers(1);

        observer1.mockReset();
        observer2.mockReset();

        observable.unregister(returnedObserver1);
        observable.unregister(observer2);
        subject.notifyObservers(1);

        expect(observer1).not.toBeCalled();
        expect(observer2).not.toBeCalled();
    });

    it('should unregister all observers', () => {
        const observer1 = jest.fn();
        const observer2 = jest.fn();
        observable.register(observer1);
        observable.register(observer2);

        observable.unregisterAll();

        subject.notifyObservers({});

        expect(observer1).not.toHaveBeenCalled();
        expect(observer2).not.toHaveBeenCalled();
    });
});

describe('Multiple observables', () => {
    let observable1: Observable<any>;
    let observable2: Observable<any>;
    let observableForValue: Observable<void>;
    let subject: Subject<any>;

    beforeEach(() => {
        subject = createSubject<any>();
        observable1 = createObservable(subject);
        observable2 = createObservable(subject);
        observableForValue = createObservableForValue(subject, 'test');
    });

    it('should notify all observables', () => {
        const observer1 = jest.fn();
        const observer2 = jest.fn();
        const observer3 = jest.fn();

        observable1.register(observer1);
        observable2.register(observer2);
        observableForValue.register(observer3);
        subject.notifyObservers('123');

        expect(observer1).toHaveBeenCalled();
        expect(observer2).toHaveBeenCalled();
        expect(observer3).not.toHaveBeenCalled(); // it is only observing for a specific value

        subject.notifyObservers('test');

        expect(observer1).toHaveBeenCalledTimes(2);
        expect(observer2).toHaveBeenCalledTimes(2);
        expect(observer3).toHaveBeenCalledTimes(1);
    });

    it('should unregister observables listeners', () => {
        const observer1 = jest.fn();
        const observer2 = jest.fn();

        observable1.register(observer1);
        observable2.register(observer2);

        observable1.unregisterAll();

        subject.notifyObservers(123);

        expect(observer1).not.toHaveBeenCalled();
        expect(observer2).toHaveBeenCalled();
    });
});

describe('Observable <-> Subject', () => {
    it('should stop notifying observers if subjects unregisters all', () => {
        const subject = createSubject();
        const observable = createObservable(subject);
        const observer = observable.register(jest.fn());

        subject.unregisterAllObservers();
        subject.notifyObservers(true);

        expect(observer).not.toHaveBeenCalled();
    });
});

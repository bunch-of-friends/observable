import { Subject, createSubject } from '../src/subject';
import { Observer } from '../src/observer';

describe('Subject', () => {
    const callbacksOwner = {};
    let subject: Subject<any>;

    beforeEach(() => {
        subject = createSubject<any>();
    });

    describe('registerObserver & notifyObservers', () => {
        it('should call the observer when notified', () => {
            const observer = jest.fn();
            subject.registerObserver(observer, callbacksOwner);

            subject.notifyObservers('data');

            expect(observer).toHaveBeenCalledTimes(1);
            expect(observer.mock.calls[0][0]).toBe('data');
        });

        it('should notify with current and previous state', () => {
            const observer = jest.fn();
            subject.registerObserver(observer, callbacksOwner);

            subject.notifyObservers('data');
            subject.notifyObservers('new-data');

            expect(observer).toHaveBeenCalledTimes(2);
            expect(observer.mock.calls[0][0]).toBe('data');
            expect(observer.mock.calls[0][1]).toBe(null);
            expect(observer.mock.calls[1][0]).toBe('new-data');
            expect(observer.mock.calls[1][1]).toBe('data');
        });

        it('should call the observer multiple times when notified multiple times', () => {
            const observer = jest.fn();
            subject.registerObserver(observer, callbacksOwner);

            subject.notifyObservers('data1');
            subject.notifyObservers('data2');

            expect(observer).toHaveBeenCalledTimes(2);
            expect(observer.mock.calls[0][0]).toBe('data1');
            expect(observer.mock.calls[1][0]).toBe('data2');
        });

        it('should call multiple observers when notified', () => {
            const observer1 = jest.fn();
            const observer2 = jest.fn();
            subject.registerObserver(observer1, callbacksOwner);
            subject.registerObserver(observer2, callbacksOwner);

            subject.notifyObservers('data');

            expect(observer1).toHaveBeenCalledTimes(1);
            expect(observer1.mock.calls[0][0]).toBe('data');
            expect(observer2).toHaveBeenCalledTimes(1);
            expect(observer2.mock.calls[0][0]).toBe('data');
        });

        it('should call multiple observers multiple times when notified multiple times', () => {
            const observer1 = jest.fn();
            const observer2 = jest.fn();
            subject.registerObserver(observer1, callbacksOwner);
            subject.registerObserver(observer2, callbacksOwner);

            subject.notifyObservers('data1');
            subject.notifyObservers('data2');

            expect(observer1).toHaveBeenCalledTimes(2);
            expect(observer1.mock.calls[0][0]).toBe('data1');
            expect(observer1.mock.calls[1][0]).toBe('data2');
            expect(observer2).toHaveBeenCalledTimes(2);
            expect(observer2.mock.calls[0][0]).toBe('data1');
            expect(observer2.mock.calls[1][0]).toBe('data2');
        });

        it('should notify on same value change with default options', () => {
            const observer = jest.fn();
            subject.registerObserver(observer, callbacksOwner);

            subject.notifyObservers('data');
            subject.notifyObservers('data');

            expect(observer).toHaveBeenCalledTimes(2);
            expect(observer.mock.calls[0][0]).toBe('data');
            expect(observer.mock.calls[1][0]).toBe('data');
        });

        it('should resolve when all observers that return promise resolve', () => {
            let testValue = 0;
            const createObserver = () => () => {
                return new Promise<void>((resolve) => {
                    setTimeout(() => {
                        testValue++;
                        resolve();
                    }, 0);
                });
            };

            subject.registerObserver(createObserver(), callbacksOwner);
            subject.registerObserver(createObserver(), callbacksOwner);
            subject.registerObserver(createObserver(), callbacksOwner);

            const waitPromise = subject.notifyObservers();
            expect(testValue).toBe(0);

            return waitPromise.then(() => {
                expect(testValue).toBe(3);
            });
        });

        it('should resolve if no observers return promise', () => {
            subject.registerObserver(jest.fn().mockReturnValue(null), callbacksOwner);

            return subject.notifyObservers().then(() => {
                expect(true).toBeTruthy(); // here just have an expectation in the test
            });
        });

        it('should resolve even if an observer returns rejected promise', () => {
            subject.registerObserver(jest.fn().mockReturnValue(Promise.reject('')), callbacksOwner);

            return subject.notifyObservers().then(() => {
                expect(true).toBeTruthy(); // here just have an expectation in the test
            });
        });
    });

    describe('unregisterObserver', () => {
        it('should unregister the observer whilst keeping other observers in tact', () => {
            const observer1 = jest.fn();
            const observer2 = jest.fn();
            subject.registerObserver(observer1, callbacksOwner);
            subject.registerObserver(observer2, callbacksOwner);

            subject.notifyObservers('data1');

            expect(observer1).toBeCalledWith('data1', null);
            expect(observer2).toBeCalledWith('data1', null);

            observer1.mockClear();
            subject.unregisterObserver(observer1);
            subject.notifyObservers('data2');

            expect(observer1).not.toBeCalled();
            expect(observer2).toHaveBeenLastCalledWith('data2', 'data1');

            observer2.mockClear();
            subject.unregisterObserver(observer2);
            subject.notifyObservers('data3');

            expect(observer1).not.toBeCalled();
            expect(observer2).not.toBeCalled();
        });
    });

    describe('unregisterObserversOfOwner', () => {
        it('should unregister the all observers of the provided owner', () => {
            const observer1 = jest.fn();
            const observer2 = jest.fn();
            subject.registerObserver(observer1, callbacksOwner);
            subject.registerObserver(observer2, callbacksOwner);

            subject.notifyObservers('data1');

            expect(observer1).toHaveBeenCalledWith('data1', null);
            expect(observer2).toHaveBeenCalledWith('data1', null);

            subject.unregisterObserversOfOwner(callbacksOwner);

            observer1.mockClear();
            observer2.mockClear();

            subject.notifyObservers('data2');

            expect(observer1).not.toBeCalled();
            expect(observer2).not.toBeCalled();
        });

        it('should only unregister observers of the provided owner', () => {
            const observer1 = jest.fn();
            const observer2 = jest.fn();
            const owner1 = { id: 1 };
            const owner2 = { id: 2 };
            subject.registerObserver(observer1, owner1);
            subject.registerObserver(observer2, owner2);

            subject.notifyObservers('data1');

            expect(observer1).toHaveBeenCalledWith('data1', null);
            expect(observer2).toHaveBeenCalledWith('data1', null);

            subject.unregisterObserversOfOwner(owner1);

            observer1.mockClear();
            observer2.mockClear();

            subject.notifyObservers('data2');

            expect(observer1).not.toBeCalled();
            expect(observer2).toHaveBeenCalledWith('data2', 'data1');
        });
    });

    describe('unregisterAllObservers', () => {
        it('should unregister all observers', () => {
            const observer1 = jest.fn();
            const observer2 = jest.fn();
            subject.registerObserver(observer1, callbacksOwner);
            subject.registerObserver(observer2, callbacksOwner);

            subject.notifyObservers('data1');

            expect(observer1).toHaveBeenCalledWith('data1', null);
            expect(observer2).toHaveBeenCalledWith('data1', null);

            subject.unregisterAllObservers();

            observer1.mockClear();
            observer2.mockClear();

            subject.notifyObservers('data2');

            expect(observer1).not.toBeCalled();
            expect(observer2).not.toBeCalled();
        });
    });

    describe('getCurrentState', () => {
        it('should return curren state', () => {
            subject.notifyObservers('data1');
            expect(subject.getCurrentState()).toBe('data1');

            subject.notifyObservers('data2');
            expect(subject.getCurrentState()).toBe('data2');
        });

        it('should set initial state provided in options otherwise should be null', () => {
            const subject1 = createSubject<any>();
            expect(subject1.getCurrentState()).toBe(null);

            const subject2 = createSubject<any>({ initialState: 'initial' });
            expect(subject2.getCurrentState()).toBe('initial');
        });

        it('should return current state value, when called from an observer', () => {
            subject.notifyObservers('data1');

            subject.registerObserver((currentState, previousState) => {
                expect(currentState).toBe(subject.getCurrentState());
            }, callbacksOwner);
        });
    });
});

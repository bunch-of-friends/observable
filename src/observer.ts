export interface Observer<T> {
    (newState: T, previousState?: T): void | Promise<void>;
}

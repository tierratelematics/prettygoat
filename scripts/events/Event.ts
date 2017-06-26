export interface Event<T = any> {
    type: string;
    payload: T;
    timestamp: Date;
}

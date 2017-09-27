export interface Event<T = any> {
    id?: string;
    type: string;
    payload: T;
    timestamp: Date;
    envelope?: any;
}

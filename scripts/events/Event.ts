export interface Event<T = any> {
    id?: string;
    type: string;
    payload: T;
    timestamp: Date;
    envelope?: any;
}

export const NullEvent = { timestamp: null, id: null, payload: null, type: null }
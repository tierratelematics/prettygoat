export interface Event<T = any> {
    id?: string;
    type: string;
    payload: T;
    timestamp: Date;
    metadata?: any;
}

export const NullEvent = {timestamp: null, id: null, payload: null, type: null};

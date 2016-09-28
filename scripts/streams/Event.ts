export interface IEvent {
    type:string;
    payload:any;
    timestamp?:string;
}

export class Event implements IEvent {
    type:string;
    payload:any;
    timestamp:string;
    splitKey:string;
}
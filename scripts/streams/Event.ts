export interface IEvent {
    type:string;
    payload:any;
    timestamp?:Date;
}

export class Event implements IEvent {
    type:string;
    payload:any;
    timestamp:Date;
    splitKey:string;
}
import { Event } from "../events/Event";

export interface IMementoProducer<T> {
    produce(event: Event): T;
}

export class MementoProducer implements IMementoProducer<any> {

    produce(event: Event<any>): any {
        return { projectionState: event.payload };
    }
}

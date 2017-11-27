import { Event } from "../events/Event";
import { injectable } from "inversify";

export interface IMementoProducer<T> {
    produce(event: Event): T;
}

@injectable()
export class MementoProducer implements IMementoProducer<any> {

    produce(event: Event<any>): any {
        return { projectionState: event.payload };
    }
}

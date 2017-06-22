import {Event} from "./Event";

export interface IReadModelPublisher {
    publish(event: Event);
}

export interface IReadModelProvider {
    modelFor<T>(projectionName: string): Promise<T>;
}

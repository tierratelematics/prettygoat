import {IProjectionRunner} from "../projections/IProjectionRunner";
import {inject, optional} from "inversify";
import {IBackpressureConfig} from "../configs/BackpressureConfig";
import IAsyncPublisher from "./IAsyncPublisher";
import BackpressurePublisher from "./BackpressurePublisher";

export interface IAsyncPublisherFactory {
    publisherFor<T>(runner: IProjectionRunner): IAsyncPublisher<T>;
}

export class AsyncPublisherFactory implements IAsyncPublisherFactory {

    constructor(@inject("IBackpressureConfig") @optional() private config: IBackpressureConfig) {
    }

    publisherFor<T>(runner: IProjectionRunner): IAsyncPublisher<T> {
        return new BackpressurePublisher(runner, this.config);
    }

}

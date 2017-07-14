import {IProjectionRunner} from "../projections/IProjectionRunner";
import BackpressurePublisher from "./BackpressurePublisher";
import {inject, optional} from "inversify";
import {IBackpressureConfig} from "../configs/BackpressureConfig";

export interface IBackpressurePublisherFactory {
    publisherFor<T>(runner: IProjectionRunner): BackpressurePublisher<T>;
}

export class BackpressurePublisherFactory implements IBackpressurePublisherFactory {

    constructor(@inject("IBackpressureConfig") @optional() private config: IBackpressureConfig) {
    }

    publisherFor<T>(runner: IProjectionRunner): BackpressurePublisher<T> {
        return new BackpressurePublisher(runner, this.config);
    }

}

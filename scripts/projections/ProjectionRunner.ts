import {Subject, IDisposable} from "rx";
import {SpecialNames} from "../matcher/SpecialNames";
import {IMatcher} from "../matcher/IMatcher";
import {IStreamFactory} from "../streams/IStreamFactory";
import IProjectionRunner from "./IProjectionRunner";
import * as Rx from "rx";
import IReadModelFactory from "../streams/IReadModelFactory";
import {Event} from "../streams/Event";
import {Snapshot} from "../snapshots/ISnapshotRepository";
import Dictionary from "../Dictionary";
import * as _ from "lodash";

export class ProjectionRunner<T> implements IProjectionRunner<T> {
    public state:T;
    private subject:Subject<Event>;
    private subscription:IDisposable;
    private isDisposed:boolean;
    private isFailed:boolean;
    private splitKey:string;

    constructor(private streamId, private stream:IStreamFactory, private matcher:IMatcher, private readModelFactory:IReadModelFactory) {
        this.subject = new Subject<Event>();
    }

    notifications() {
        return this.subject;
    }

    run(snapshot?:Snapshot<T|Dictionary<T>>):void {
        if (this.isDisposed)
            throw new Error(`${this.streamId}: cannot run a disposed projection`);

        if (this.subscription !== undefined)
            return;

        this.state = snapshot ? snapshot.memento : this.matcher.match(SpecialNames.Init)();
        this.publishReadModel();

        let eventsStream = this.stream
            .from(snapshot ? snapshot.lastEvent : null)
            .merge(this.readModelFactory.from(null))
            .filter(event => event.type !== this.streamId && !_.startsWith(event.type, "__diagnostic"));

        this.subscription = eventsStream.subscribe(event => {
            try {
                let matchFunction = this.matcher.match(event.type);
                if (matchFunction !== Rx.helpers.identity) {
                    this.state = matchFunction(this.state, event.payload, event);
                    this.publishReadModel(event.timestamp);
                }
            } catch (error) {
                this.isFailed = true;
                this.subject.onError(error);
                this.stop();
            }
        });
    }

    stop():void {
        this.isDisposed = true;

        if (this.subscription)
            this.subscription.dispose();
        if (!this.isFailed)
            this.subject.onCompleted();
    }

    dispose():void {
        this.stop();
        if (!this.subject.isDisposed)
            this.subject.dispose();
    }

    private publishReadModel(timestamp:string = "") {
        let readModel = {payload: this.state, type: this.streamId, timestamp: timestamp, splitKey: null};
        this.subject.onNext(readModel);
        if (!this.splitKey) this.readModelFactory.publish(readModel);
    };
}


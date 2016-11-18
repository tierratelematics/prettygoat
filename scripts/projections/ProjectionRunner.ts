import {Subject, IDisposable} from "rx";
import {SpecialNames} from "../matcher/SpecialNames";
import {IMatcher} from "../matcher/IMatcher";
import {IStreamFactory} from "../streams/IStreamFactory";
import IProjectionRunner from "./IProjectionRunner";
import {IProjection} from "./IProjection";
import * as Rx from "rx";
import IReadModelFactory from "../streams/IReadModelFactory";
import {Event} from "../streams/Event";
import {Snapshot} from "../snapshots/ISnapshotRepository";
import Dictionary from "../Dictionary";
import {mergeStreams} from "./ProjectionStream";
import IDateRetriever from "../util/IDateRetriever";
import IProjectionDependency from "./IProjectionDependency";
import * as _ from "lodash";


export class ProjectionRunner<T> implements IProjectionRunner<T> {
    private streamId:string;
    public state:T;
    private subject:Subject<Event>;
    private subscription:Rx.IDisposable;
    private isDisposed:boolean;
    private isFailed:boolean;
    private dependencyList:string[];

    constructor(private projection:IProjection<T>, private stream:IStreamFactory, private matcher:IMatcher, private readModelFactory:IReadModelFactory,
                private tickScheduler:IStreamFactory, private dateRetriever:IDateRetriever, private dependency:IProjectionDependency) {
        this.subject = new Subject<Event>();
        this.streamId = projection.name;
        this.dependencyList = this.dependency.dependencyList(projection);
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
        this.publishReadModel(new Date(1));
        let combinedStream = new Rx.Subject<Event>();

        this.subscription = combinedStream.subscribe(event => {
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

        mergeStreams(
            combinedStream,
            this.stream.from(snapshot ? snapshot.lastEvent : null, this.projection.definition),
            this.readModelFactory.from(null).filter(event => event.type !== this.streamId && _.includes(this.dependencyList, event.type)),
            this.tickScheduler.from(null),
            this.dateRetriever);
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

    private publishReadModel(timestamp:Date) {
        this.subject.onNext({payload: this.state, type: this.streamId, timestamp: timestamp, splitKey: null});
        this.readModelFactory.publish({payload: this.state, type: this.streamId, timestamp: null, splitKey: null});
    }
}


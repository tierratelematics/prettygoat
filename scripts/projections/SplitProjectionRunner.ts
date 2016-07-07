import {IMatcher} from "../matcher/IMatcher";
import {IStreamFactory} from "../streams/IStreamFactory";
import * as Rx from "rx";
import IProjectionRunner from "./IProjectionRunner";
import {IProjection} from "./IProjection";
import {Matcher} from "../matcher/Matcher";
import {ProjectionRunner} from "./ProjectionRunner";
import SplitStreamFactory from "../streams/SplitStreamFactory";
import Dictionary from "../Dictionary";
import IReadModelFactory from "../streams/IReadModelFactory";
import NotificationState from "../push/NotificationState";
import {ISnapshotRepository} from "../snapshots/ISnapshotRepository";

export class SplitProjectionRunner<T> implements IProjectionRunner<T> {
    public state:T;
    private subscription:Rx.IDisposable;
    private isDisposed:boolean;
    private isFailed:boolean;
    private subject:Rx.Subject<NotificationState<T>>;
    private streamId:string;
    private splitMatcher:IMatcher;
    private runners:Dictionary<IProjectionRunner<T>> = {};
    private subjects:Dictionary<Rx.Subject<any>> = {};

    constructor(private projection:IProjection<T>, private stream:IStreamFactory, private repository:ISnapshotRepository,
                private matcher:IMatcher, private aggregateFactory:IReadModelFactory) {
        this.subject = new Rx.Subject<NotificationState<T>>();
        this.streamId = projection.name;
        this.splitMatcher = new Matcher(projection.split);
    }

    run():void {
        if (this.isDisposed)
            throw new Error(`${this.streamId}: cannot run a disposed projection`);

        if (this.subscription !== undefined)
            return;

        this.subscription = this.stream.from(null).subscribe((event:any) => {
            try {
                let splitFn = this.splitMatcher.match(event.type),
                    splitKey = splitFn(event.payload);
                if (splitFn !== Rx.helpers.identity) {
                    if (!this.runners[splitKey]) {
                        this.subjects[splitKey] = new Rx.Subject<any>();
                        let streamFactory = new SplitStreamFactory(this.subjects[splitKey]);
                        let runner = new ProjectionRunner(this.projection, streamFactory, this.repository, this.matcher, this.aggregateFactory);
                        runner.setSplitKey(splitKey);
                        this.runners[splitKey] = runner;
                        runner.run();
                    }
                    this.subjects[splitKey].onNext(event);
                    this.subject.onNext({splitKey: splitKey, state: null});
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

    runnerFor(key:string):IProjectionRunner<T> {
        return this.runners[key];
    }

    subscribe(observer:Rx.IObserver<NotificationState<T>>):Rx.IDisposable
    subscribe(onNext?:(value:NotificationState<T>) => void, onError?:(exception:any) => void, onCompleted?:() => void):Rx.IDisposable
    subscribe(observerOrOnNext?:(Rx.IObserver<NotificationState<T>>) | ((value:NotificationState<T>) => void), onError?:(exception:any) => void, onCompleted?:() => void):Rx.IDisposable {
        if (isObserver(observerOrOnNext))
            return this.subject.subscribe(observerOrOnNext);
        else
            return this.subject.subscribe(observerOrOnNext, onError, onCompleted);
    }
}

function isObserver<T>(observerOrOnNext:(Rx.IObserver<NotificationState<T>>) | ((value:NotificationState<T>) => void)):observerOrOnNext is Rx.IObserver<NotificationState<T>> {
    return (<Rx.IObserver<NotificationState<T>>>observerOrOnNext).onNext !== undefined;
}


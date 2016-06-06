import {ISnapshotRepository, Snapshot} from "../streams/ISnapshotRepository";
import {IMatcher} from "../matcher/IMatcher";
import {IStreamFactory} from "../streams/IStreamFactory";
import * as Rx from "rx";
import IProjectionRunner from "./IProjectionRunner";
import {IProjection} from "./IProjection";
import {Matcher} from "../matcher/Matcher";
import {Dictionary} from "~lodash/index";
import {ProjectionRunner} from "./ProjectionRunner";
import SplitStreamFactory from "../streams/SplitStreamFactory";

export class SplitProjectionRunner<T> implements IProjectionRunner<T> {
    public state:T;
    private subscription:Rx.IDisposable;
    private isDisposed:boolean;
    private isFailed:boolean;
    private subject:Rx.Subject<T>;
    private streamId:string;
    private splitMatcher:IMatcher;
    private runners:Dictionary<IProjectionRunner<T>> = {};
    private subjects:Dictionary<Rx.Subject<any>> = {};

    constructor(private projection:IProjection<T>, private stream:IStreamFactory, private repository:ISnapshotRepository, private matcher:IMatcher) {
        this.subject = new Rx.Subject<T>();
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
                let splitKey = this.splitMatcher.match(event.type)(event.payload);
                if (!this.runners[splitKey]) {
                    this.subjects[splitKey] = new Rx.Subject<any>();
                    let runner = new ProjectionRunner(this.projection, new SplitStreamFactory(this.subjects[splitKey]), this.repository, this.matcher);
                    this.runners[splitKey] = runner;
                    runner.run();
                }
                this.subjects[splitKey].onNext(event);
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

    getRunnerFor(key:string):IProjectionRunner<T> {
        return this.runners[key];
    }

    subscribe(observer:Rx.IObserver<T>):Rx.IDisposable
    subscribe(onNext?:(value:T) => void, onError?:(exception:any) => void, onCompleted?:() => void):Rx.IDisposable
    subscribe(observerOrOnNext?:(Rx.IObserver<T>) | ((value:T) => void), onError?:(exception:any) => void, onCompleted?:() => void):Rx.IDisposable {
        if (isObserver(observerOrOnNext))
            return this.subject.subscribe(observerOrOnNext);
        else
            return this.subject.subscribe(observerOrOnNext, onError, onCompleted);
    }
}

function isObserver<T>(observerOrOnNext:(Rx.IObserver<T>) | ((value:T) => void)):observerOrOnNext is Rx.IObserver<T> {
    return (<Rx.IObserver<T>>observerOrOnNext).onNext !== undefined;
}


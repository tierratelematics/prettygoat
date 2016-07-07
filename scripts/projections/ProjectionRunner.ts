import {Subject, IDisposable} from "rx";
import {SpecialNames} from "../matcher/SpecialNames";
import {IMatcher} from "../matcher/IMatcher";
import {IStreamFactory} from "../streams/IStreamFactory";
import IProjectionRunner from "./IProjectionRunner";
import * as Rx from "rx";
import {IProjection} from "./IProjection";
import IReadModelFactory from "../streams/IReadModelFactory";
import {ISnapshotRepository} from "../snapshots/ISnapshotRepository";
import Event from "../streams/Event";

export class ProjectionRunner<T> implements IProjectionRunner<T> {
    public state:T;
    private subject:Subject<Event>;
    private subscription:IDisposable;
    private isDisposed:boolean;
    private isFailed:boolean;
    private streamId:string;
    private splitKey:string;

    constructor(private projection:IProjection<T>, private stream:IStreamFactory, private repository:ISnapshotRepository,
                private matcher:IMatcher, private readModelFactory:IReadModelFactory) {
        this.subject = new Subject<Event>();
        this.streamId = projection.name;
    }

    run():void {
        if (this.isDisposed)
            throw new Error(`${this.streamId}: cannot run a disposed projection`);

        if (this.subscription !== undefined)
            return;

        this.state = this.matcher.match(SpecialNames.Init)();
        this.publishReadModel();

        this.subscription = this.stream.from(null).merge(this.readModelFactory.from(null)).subscribe(event => {
            try {
                let matchFunction = this.matcher.match(event.type);
                if (matchFunction !== Rx.helpers.identity) {
                    this.state = matchFunction(this.state, event.payload);
                    this.publishReadModel();
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

    setSplitKey(key:string) {
        this.splitKey = key;
    }

    private publishReadModel() {
        this.subject.onNext({splitKey: this.splitKey, payload: this.state, type: this.projection.name});
        if (!this.splitKey) {
            this.readModelFactory.publish({
                type: this.projection.name,
                payload: this.state
            });
        }
    };

    subscribe(observer:Rx.IObserver<Event>):Rx.IDisposable
    subscribe(onNext?:(value:Event) => void, onError?:(exception:any) => void, onCompleted?:() => void):Rx.IDisposable
    subscribe(observerOrOnNext?:(Rx.IObserver<Event>) | ((value:Event) => void), onError?:(exception:any) => void, onCompleted?:() => void):Rx.IDisposable {
        if (isObserver(observerOrOnNext))
            return this.subject.subscribe(observerOrOnNext);
        else
            return this.subject.subscribe(observerOrOnNext, onError, onCompleted);
    }
}

function isObserver<T>(observerOrOnNext:(Rx.IObserver<Event>) | ((value:Event) => void)):observerOrOnNext is Rx.IObserver<Event> {
    return (<Rx.IObserver<Event>>observerOrOnNext).onNext !== undefined;
}


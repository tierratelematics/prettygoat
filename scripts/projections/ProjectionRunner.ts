import {Subject, IDisposable} from "rx";
import {SpecialNames} from "../matcher/SpecialNames";
import {IMatcher} from "../matcher/IMatcher";
import {IStreamFactory} from "../streams/IStreamFactory";
import IProjectionRunner from "./IProjectionRunner";
import * as Rx from "rx";
import IReadModelFactory from "../streams/IReadModelFactory";
import Event from "../streams/Event";

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

    private publishReadModel() {
        let readModel = {payload: this.state, type: this.streamId};
        this.subject.onNext(readModel);
        if (!this.splitKey) this.readModelFactory.publish(readModel);
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


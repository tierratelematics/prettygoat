import {Subject, IDisposable} from "rx";
import {IMatcher} from "../matcher/IMatcher";
import IProjectionRunner from "./IProjectionRunner";
import * as Rx from "rx";
import IReadModelFactory from "../streams/IReadModelFactory";
import Event from "../streams/Event";
import {SpecialNames} from "../matcher/SpecialNames";

export class ProjectionRunner<T> implements IProjectionRunner<T> {
    public state:T;
    private subject:Subject<Event<T>>;
    private subscription:IDisposable;
    private isDisposed:boolean;
    private isFailed:boolean;

    constructor(private projectionName:string, private matcher:IMatcher, private readModelFactory:IReadModelFactory, private splitKey?:string) {
        this.subject = new Subject<Event<T>>();
    }

    initializeWith(value:T) {
        if (this.isDisposed)
            throw new Error(`${this.projectionName}: cannot run a disposed projection`);

        if (this.subscription !== undefined)
            return;

        this.state = value || this.matcher.match(SpecialNames.Init)();
        this.publishReadModel();
    }

    handle(event:Event<T>) {
        try {
            let matchFunction = this.matcher.match(event.type);
            if (matchFunction !== Rx.helpers.identity) {
                this.state = matchFunction(this.state, event.payload);
                this.publishReadModel();
            }
        } catch (error) {
            this.isFailed = true;
            this.subject.onError(error);
            this.dispose();
        }
    }

    dispose():void {
        this.isDisposed = true;
        if (this.subscription)
            this.subscription.dispose();
        if (!this.isFailed)
            this.subject.onCompleted();
        if (!this.subject.isDisposed)
            this.subject.dispose();
    }

    private publishReadModel() {
        this.subject.onNext({
            splitKey: this.splitKey,
            type: this.projectionName,
            payload: this.state
        });
        this.readModelFactory.publish({
            type: this.projectionName,
            payload: this.state
        });
    };

    subscribe(observer:Rx.IObserver<Event<T>>):Rx.IDisposable
    subscribe(onNext?:(value:Event<T>) => void, onError?:(exception:any) => void, onCompleted?:() => void):Rx.IDisposable
    subscribe(observerOrOnNext?:(Rx.IObserver<Event<T>>) | ((value:Event<T>) => void), onError?:(exception:any) => void, onCompleted?:() => void):Rx.IDisposable {
        if (isObserver(observerOrOnNext))
            return this.subject.subscribe(observerOrOnNext);
        else
            return this.subject.subscribe(observerOrOnNext, onError, onCompleted);
    }
}

function isObserver<T>(observerOrOnNext:(Rx.IObserver<Event<T>>) | ((value:Event<T>) => void)):observerOrOnNext is Rx.IObserver<Event<T>> {
    return (<Rx.IObserver<Event<T>>>observerOrOnNext).onNext !== undefined;
}


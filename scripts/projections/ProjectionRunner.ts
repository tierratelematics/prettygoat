import {Subject, IDisposable} from "rx";
import {IMatcher} from "../matcher/IMatcher";
import IProjectionRunner from "./IProjectionRunner";
import * as Rx from "rx";
import IReadModelFactory from "../streams/IReadModelFactory";
import NotificationState from "../push/NotificationState";
import Event from "../streams/Event";
import {SpecialNames} from "../matcher/SpecialNames";

export class ProjectionRunner<T> implements IProjectionRunner<T> {
    public state:T;
    private subject:Subject<NotificationState<T>>;
    private subscription:IDisposable;
    private isDisposed:boolean;
    private isFailed:boolean;
    private splitKey:string;

    constructor(private projectionName:string, private matcher:IMatcher, private readModelFactory:IReadModelFactory) {
        this.subject = new Subject<NotificationState<T>>();
    }

    initializeWith(value:T) {
        if (this.isDisposed)
            throw new Error(`${this.projectionName}: cannot run a disposed projection`);

        if (this.subscription !== undefined)
            return;

        this.state = value || this.matcher.match(SpecialNames.Init)();
        this.publishReadModel();
    }

    handle(event:Event) {
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
        this.subject.onNext({splitKey: this.splitKey, state: this.state});
        this.readModelFactory.publish({
            type: this.projectionName,
            payload: this.state
        });
    };

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


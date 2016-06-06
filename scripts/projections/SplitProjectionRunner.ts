import {ISnapshotRepository} from "../streams/ISnapshotRepository";
import {IMatcher} from "../matcher/IMatcher";
import {IStreamFactory} from "../streams/IStreamFactory";
import * as Rx from "rx";
import IProjectionRunner from "./IProjectionRunner";
import {IProjection} from "./IProjection";
import {Matcher} from "../matcher/Matcher";

export class SplitProjectionRunner<T> implements IProjectionRunner<T> {
    public state:T;
    private subject:Rx.Subject<T>;
    private streamId:string;
    private splitMatcher:IMatcher;

    constructor(private projection:IProjection<T>, private stream:IStreamFactory, private repository:ISnapshotRepository, private matcher:IMatcher) {
        this.streamId = projection.name;
        this.splitMatcher = new Matcher(projection.split);
    }

    run():void {
    }

    stop():void {

    }

    dispose():void {
        this.stop();
        if (!this.subject.isDisposed)
            this.subject.dispose();
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


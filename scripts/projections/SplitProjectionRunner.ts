import {ISnapshotRepository, Snapshot} from "../streams/ISnapshotRepository";
import {SpecialNames} from "../matcher/SpecialNames";
import {IMatcher} from "../matcher/IMatcher";
import {IStreamFactory} from "../streams/IStreamFactory";
import * as Rx from "rx";
import IProjectionRunner from "./IProjectionRunner";

export class SplitProjectionRunner<T> implements IProjectionRunner<T> {
    state:T;
    private subject:Rx.Subject<T>;

    constructor(streamId:string, stream:IStreamFactory, repository:ISnapshotRepository,
                definitionMatcher:IMatcher, private splitMatcher:IMatcher) {

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


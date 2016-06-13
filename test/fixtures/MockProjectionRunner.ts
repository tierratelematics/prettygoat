import IProjectionRunner from "../../scripts/projections/IProjectionRunner";
import MockModel from "./MockModel";
import {Subject} from "rx";

class MockProjectionRunner implements IProjectionRunner<MockModel> {
    state:MockModel;
    private subject:Subject<MockModel>;

    constructor(subject?:Subject<MockModel>) {
        this.subject = subject;
    }

    run():void {
    }

    stop():void {
    }

    subscribe(observer:Rx.IObserver<MockModel>):Rx.IDisposable
    subscribe(onNext?:(value:MockModel) => void, onError?:(exception:any) => void, onCompleted?:() => void):Rx.IDisposable
    subscribe(observerOrOnNext?:(Rx.IObserver<MockModel>) | ((value:MockModel) => void), onError?:(exception:any) => void, onCompleted?:() => void):Rx.IDisposable {
        if (isObserver(observerOrOnNext))
            return this.subject.subscribe(observerOrOnNext);
        else
            return this.subject.subscribe(observerOrOnNext, onError, onCompleted);
    }

    dispose():void {
    }

}

function isObserver<T>(observerOrOnNext:(Rx.IObserver<T>) | ((value:T) => void)):observerOrOnNext is Rx.IObserver<T> {
    return (<Rx.IObserver<T>>observerOrOnNext).onNext !== undefined;
}

export default MockProjectionRunner
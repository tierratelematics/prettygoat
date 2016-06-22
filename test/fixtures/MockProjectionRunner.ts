import IProjectionRunner from "../../scripts/projections/IProjectionRunner";
import MockModel from "./MockModel";
import {Subject} from "rx";
import NotificationState from "../../scripts/push/NotificationState";

class MockProjectionRunner implements IProjectionRunner<MockModel> {
    state:MockModel;
    private subject:Subject<NotificationState<MockModel>>;

    constructor(subject?:Subject<NotificationState<MockModel>>) {
        this.subject = subject;
    }

    run():void {
    }

    stop():void {
    }

    dispose():void {

    }

    subscribe(observer:Rx.IObserver<NotificationState<MockModel>>):Rx.IDisposable
    subscribe(onNext?:(value:NotificationState<MockModel>) => void, onError?:(exception:any) => void, onCompleted?:() => void):Rx.IDisposable
    subscribe(observerOrOnNext?:(Rx.IObserver<NotificationState<MockModel>>) | ((value:NotificationState<MockModel>) => void), onError?:(exception:any) => void, onCompleted?:() => void):Rx.IDisposable {
        if (isObserver(observerOrOnNext))
            return this.subject.subscribe(observerOrOnNext);
        else
            return this.subject.subscribe(observerOrOnNext, onError, onCompleted);
    }
}

function isObserver<T>(observerOrOnNext:(Rx.IObserver<NotificationState<T>>) | ((value:NotificationState<T>) => void)):observerOrOnNext is Rx.IObserver<NotificationState<T>> {
    return (<Rx.IObserver<NotificationState<T>>>observerOrOnNext).onNext !== undefined;
}


export default MockProjectionRunner
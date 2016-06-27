import IProjectionRunner from "../../scripts/projections/IProjectionRunner";
import MockModel from "./MockModel";
import {Subject} from "rx";
import Event from "../../scripts/streams/Event";

class MockProjectionRunner implements IProjectionRunner<MockModel> {
    state:MockModel;

    private subject:Subject<Event<MockModel>>;

    constructor(subject?:Subject<Event<MockModel>>) {
        this.subject = subject;
    }

    initializeWith(value:MockModel) {

    }

    handle(event:Event<MockModel>) {

    }

    dispose() {

    }

    subscribe(observer:Rx.IObserver<Event<MockModel>>):Rx.IDisposable
    subscribe(onNext?:(value:Event<MockModel>) => void, onError?:(exception:any) => void, onCompleted?:() => void):Rx.IDisposable
    subscribe(observerOrOnNext?:(Rx.IObserver<Event<MockModel>>) | ((value:Event<MockModel>) => void), onError?:(exception:any) => void, onCompleted?:() => void):Rx.IDisposable {
        if (isObserver(observerOrOnNext))
            return this.subject.subscribe(observerOrOnNext);
        else
            return this.subject.subscribe(observerOrOnNext, onError, onCompleted);
    }
}

function isObserver<T>(observerOrOnNext:(Rx.IObserver<Event<T>>) | ((value:Event<T>) => void)):observerOrOnNext is Rx.IObserver<Event<T>> {
    return (<Rx.IObserver<Event<T>>>observerOrOnNext).onNext !== undefined;
}


export default MockProjectionRunner
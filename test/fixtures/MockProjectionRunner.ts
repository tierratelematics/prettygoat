import IProjectionRunner from "../../scripts/projections/IProjectionRunner";
import MockModel from "./MockModel";
import {Subject} from "rx";
import {Event} from "../../scripts/streams/Event";

class MockProjectionRunner implements IProjectionRunner<MockModel> {
    state:MockModel;
    private subject:Subject<Event>;

    constructor(data?:Subject<Event>) {
        this.subject = data;
    }

    notifications() {
        return this.subject;
    }

    run():void {

    }

    stop():void {
    }

    pause():void {
    }

    resume():void {
    }

    dispose():void {

    }
}

function isObserver<T>(observerOrOnNext:(Rx.IObserver<Event>) | ((value:Event) => void)):observerOrOnNext is Rx.IObserver<Event> {
    return (<Rx.IObserver<Event>>observerOrOnNext).onNext !== undefined;
}


export default MockProjectionRunner
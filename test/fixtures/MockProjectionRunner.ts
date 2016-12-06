import IProjectionRunner from "../../scripts/projections/IProjectionRunner";
import MockModel from "./MockModel";
import {Subject} from "rx";
import {Event} from "../../scripts/streams/Event";
import ProjectionStats from "../../scripts/projections/ProjectionStats";
import {ProjectionRunnerStatus} from "../../scripts/projections/ProjectionRunnerStatus";

class MockProjectionRunner implements IProjectionRunner<MockModel> {
    state:MockModel;
    stats:ProjectionStats;
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
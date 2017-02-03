import IProjectionRunner from "../../scripts/projections/IProjectionRunner";
import {Subject, IObserver} from "rx";
import {Event} from "../../scripts/streams/Event";
import ProjectionStats from "../../scripts/projections/ProjectionStats";
import {Snapshot} from "../../scripts/snapshots/ISnapshotRepository";
import Dictionary from "../../scripts/util/Dictionary";

class MockProjectionRunner<T> implements IProjectionRunner<T> {
    state:T;
    stats = new ProjectionStats();
    private subject:Subject<Event>;

    constructor(data?:Subject<Event>) {
        this.subject = data;
    }

    notifications() {
        return this.subject;
    }

    run(snapshot?:Snapshot<T|Dictionary<T>>):void {

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

function isObserver<T>(observerOrOnNext:(Rx.IObserver<Event>) | ((value:Event) => void)):observerOrOnNext is IObserver<Event> {
    return (<IObserver<Event>>observerOrOnNext).onNext !== undefined;
}


export default MockProjectionRunner
import IProjectionEngine from "../../scripts/projections/IProjectionEngine";
import {Snapshot} from "../../scripts/snapshots/ISnapshotRepository";
import PushContext from "../../scripts/push/PushContext";
import {IProjection} from "../../scripts/projections/IProjection";

export default class MockProjectionEngine implements IProjectionEngine {
    run(projection?: IProjection<any>, context?: PushContext, snapshot?:Snapshot<any>) {

    }

    restart(projection?: IProjection<any>, context?: PushContext, snapshot?:Snapshot<any>) {

    }
}
import {IProjection} from "./IProjection";
import PushContext from "../push/PushContext";
import {Snapshot} from "../snapshots/ISnapshotRepository";

interface IProjectionEngine {
    run(projection?: IProjection<any>, context?: PushContext, snapshot?:Snapshot<any>);
    restart(projection?: IProjection<any>, context?: PushContext, snapshot?:Snapshot<any>);
}

export default IProjectionEngine
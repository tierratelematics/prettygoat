import {IProjection} from "./IProjection";
import PushContext from "../push/PushContext";

interface IProjectionEngine {
    run(projection?: IProjection<any>, context?: PushContext);
    restart(projection?: IProjection<any>, context?: PushContext);
}

export default IProjectionEngine